import Papa from 'papaparse';
import { parse, differenceInDays, differenceInMonths } from 'date-fns';
import type { AccountRecord, FinancialRecord, JotformRecord, AnalysisResult } from './types';

export async function parseCSVFile<T>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        resolve(results.data as T[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

/**
 * Returns true if an account record represents a cancelled member.
 * MembershipWorks used to set Cancel = 'Cancel'. Starting in January 2026
 * they stopped updating that column and instead set Billing Method = 'Cancelled'.
 * We check both so that data from any time period is handled correctly.
 */
function isCanceled(acc: AccountRecord): boolean {
  return (
    acc.Cancel?.trim() === 'Cancel' ||
    acc['Billing Method']?.trim() === 'Cancelled'
  );
}

export function analyzeData(
  accountsData: AccountRecord[],
  financialData: FinancialRecord[],
  jotformData: JotformRecord[]
): AnalysisResult {
  // Overall Member Stats
  const totalMembers = accountsData.length;
  const canceledMembers = accountsData.filter(isCanceled).length;
  const activeMembers = totalMembers - canceledMembers;
  const cancellationRate = totalMembers > 0 ? (canceledMembers / totalMembers) * 100 : 0;

  // Free Promo Analysis
  const freePromoTransactions = financialData.filter(
    txn => txn['Discount Code']?.toLowerCase().trim() === 'free'
  );

  const freePromoAccountIds = new Set(
    freePromoTransactions
      .map(txn => txn['Account ID']?.trim())
      .filter(id => id)
  );

  // Calculate date range and usage patterns
  const transactionDates = freePromoTransactions
    .map(txn => {
      try {
        return parse(txn.Date, 'MMM d, yyyy', new Date());
      } catch {
        return null;
      }
    })
    .filter((date): date is Date => date !== null)
    .sort((a, b) => a.getTime() - b.getTime());

  const firstUsage = transactionDates.length > 0
    ? transactionDates[0].toISOString().split('T')[0]
    : '';
  const lastUsage = transactionDates.length > 0
    ? transactionDates[transactionDates.length - 1].toISOString().split('T')[0]
    : '';

  const usagePeriodDays = transactionDates.length >= 2
    ? differenceInDays(transactionDates[transactionDates.length - 1], transactionDates[0]) + 1
    : 0;

  const avgTransactionsPerDay = usagePeriodDays > 0
    ? freePromoTransactions.length / usagePeriodDays
    : 0;
  const avgUsersPerDay = usagePeriodDays > 0
    ? freePromoAccountIds.size / usagePeriodDays
    : 0;

  // Monthly breakdown
  const monthlyData = new Map<string, { transactions: number; users: Set<string> }>();
  freePromoTransactions.forEach(txn => {
    try {
      const date = parse(txn.Date, 'MMM d, yyyy', new Date());
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { transactions: 0, users: new Set() });
      }

      const data = monthlyData.get(monthKey)!;
      data.transactions++;
      if (txn['Account ID']?.trim()) {
        data.users.add(txn['Account ID'].trim());
      }
    } catch {
      // Skip invalid dates
    }
  });

  const monthlyBreakdown = Array.from(monthlyData.entries())
    .map(([month, data]) => {
      // Calculate how many users from this month's cohort have canceled
      const canceledUsersCount = Array.from(data.users).filter(userId => {
        const account = accountsData.find(acc => acc['Account ID']?.trim() === userId);
        return account ? isCanceled(account) : false;
      }).length;

      return {
        month,
        transactions: data.transactions,
        uniqueUsers: data.users.size,
        canceledUsers: canceledUsersCount,
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));

  // Check cancellation status for free promo users
  const freePromoCanceled = accountsData.filter(
    acc => freePromoAccountIds.has(acc['Account ID']?.trim()) && isCanceled(acc)
  ).length;
  const freePromoActive = freePromoAccountIds.size - freePromoCanceled;
  const freePromoCancellationRate = freePromoAccountIds.size > 0
    ? (freePromoCanceled / freePromoAccountIds.size) * 100
    : 0;

  // Jotform Pipeline Analysis
  const totalJotformSubmissions = jotformData.length;
  const jotformEmails = new Set(
    jotformData
      .map(rec => rec['Please enter your email to see your results.']?.toLowerCase().trim())
      .filter(email => email)
  );

  const duplicateJotformSubmissions = totalJotformSubmissions - jotformEmails.size;

  // Filter Jotform submissions from August 6, 2025 onward (when free trial was offered)
  const freeTrialStartDate = new Date('2025-08-06');

  const jotformDataBeforeFreeTrial = jotformData.filter(rec => {
    try {
      const submissionDate = parse(rec['Submission Date'], 'MMM d, yyyy', new Date());
      return submissionDate < freeTrialStartDate;
    } catch {
      return false;
    }
  });

  const jotformDataSinceFreeTrial = jotformData.filter(rec => {
    try {
      const submissionDate = parse(rec['Submission Date'], 'MMM d, yyyy', new Date());
      return submissionDate >= freeTrialStartDate;
    } catch {
      return false;
    }
  });

  const jotformEmailsBeforeFreeTrial = new Set(
    jotformDataBeforeFreeTrial
      .map(rec => rec['Please enter your email to see your results.']?.toLowerCase().trim())
      .filter(email => email)
  );

  const jotformEmailsSinceFreeTrial = new Set(
    jotformDataSinceFreeTrial
      .map(rec => rec['Please enter your email to see your results.']?.toLowerCase().trim())
      .filter(email => email)
  );

  // Match with members
  const memberEmails = new Map<string, string>();
  accountsData.forEach(acc => {
    const email = acc.Email?.toLowerCase().trim();
    const accountId = acc['Account ID']?.trim();
    if (email && accountId) {
      memberEmails.set(email, accountId);
    }
  });

  const jotformMemberAccountIds = new Set<string>();
  jotformEmails.forEach(email => {
    const accountId = memberEmails.get(email);
    if (accountId) {
      jotformMemberAccountIds.add(accountId);
    }
  });

  // Jotform members from BEFORE free trial period
  const jotformMemberAccountIdsBeforeFreeTrial = new Set<string>();
  jotformEmailsBeforeFreeTrial.forEach(email => {
    const accountId = memberEmails.get(email);
    if (accountId) {
      jotformMemberAccountIdsBeforeFreeTrial.add(accountId);
    }
  });

  // Jotform members from free trial period
  const jotformMemberAccountIdsSinceFreeTrial = new Set<string>();
  jotformEmailsSinceFreeTrial.forEach(email => {
    const accountId = memberEmails.get(email);
    if (accountId) {
      jotformMemberAccountIdsSinceFreeTrial.add(accountId);
    }
  });

  const convertedToMembers = jotformMemberAccountIds.size;
  const convertedBeforeFreeTrial = jotformMemberAccountIdsBeforeFreeTrial.size;
  const convertedToMembersSinceFreeTrial = jotformMemberAccountIdsSinceFreeTrial.size;
  const conversionRate = jotformEmails.size > 0
    ? (convertedToMembers / jotformEmails.size) * 100
    : 0;
  const conversionRateBeforeFreeTrial = jotformEmailsBeforeFreeTrial.size > 0
    ? (convertedBeforeFreeTrial / jotformEmailsBeforeFreeTrial.size) * 100
    : 0;
  const conversionRateSinceFreeTrial = jotformEmailsSinceFreeTrial.size > 0
    ? (convertedToMembersSinceFreeTrial / jotformEmailsSinceFreeTrial.size) * 100
    : 0;

  // Calculate gross vs net for before free trial
  const canceledBeforeFreeTrial = accountsData.filter(
    acc => Array.from(jotformMemberAccountIdsBeforeFreeTrial).includes(acc['Account ID']?.trim()) &&
      isCanceled(acc)
  ).length;
  const activeBeforeFreeTrial = convertedBeforeFreeTrial - canceledBeforeFreeTrial;
  const cancellationRateBeforeFreeTrial = convertedBeforeFreeTrial > 0
    ? (canceledBeforeFreeTrial / convertedBeforeFreeTrial) * 100
    : 0;
  const netConversionRateBeforeFreeTrial = jotformEmailsBeforeFreeTrial.size > 0
    ? (activeBeforeFreeTrial / jotformEmailsBeforeFreeTrial.size) * 100
    : 0;

  // Find Jotform members who used free trial (only from free trial period)
  const jotformFreeTrialUsers = Array.from(jotformMemberAccountIdsSinceFreeTrial).filter(id =>
    freePromoAccountIds.has(id)
  );
  const jotformPaidUsers = convertedToMembersSinceFreeTrial - jotformFreeTrialUsers.length;
  const freeTrialRate = convertedToMembersSinceFreeTrial > 0
    ? (jotformFreeTrialUsers.length / convertedToMembersSinceFreeTrial) * 100
    : 0;

  // Check cancellation for Jotform free trial users
  const jotformFreeTrialCanceled = accountsData.filter(
    acc => jotformFreeTrialUsers.includes(acc['Account ID']?.trim()) &&
      isCanceled(acc)
  ).length;
  const jotformFreeTrialActive = jotformFreeTrialUsers.length - jotformFreeTrialCanceled;
  const jotformFreeTrialCancellationRate = jotformFreeTrialUsers.length > 0
    ? (jotformFreeTrialCanceled / jotformFreeTrialUsers.length) * 100
    : 0;

  // Calculate gross vs net for SINCE free trial (all conversions, not just free trial users)
  const canceledSinceFreeTrial = accountsData.filter(
    acc => Array.from(jotformMemberAccountIdsSinceFreeTrial).includes(acc['Account ID']?.trim()) &&
      isCanceled(acc)
  ).length;
  const activeSinceFreeTrial = convertedToMembersSinceFreeTrial - canceledSinceFreeTrial;
  const cancellationRateSinceFreeTrial = convertedToMembersSinceFreeTrial > 0
    ? (canceledSinceFreeTrial / convertedToMembersSinceFreeTrial) * 100
    : 0;
  const netConversionRateSinceFreeTrial = jotformEmailsSinceFreeTrial.size > 0
    ? (activeSinceFreeTrial / jotformEmailsSinceFreeTrial.size) * 100
    : 0;

  // Monthly Breakdown of Jotform Conversions
  const monthlyJotformData = new Map<string, { submissions: number; emails: Set<string>; conversions: number }>();

  // Use all jotformData for the monthly breakdown
  jotformData.forEach(rec => {
    try {
      const date = parse(rec['Submission Date'], 'MMM d, yyyy', new Date());
      // format as YYYY-MM
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyJotformData.has(monthKey)) {
        monthlyJotformData.set(monthKey, { submissions: 0, emails: new Set(), conversions: 0 });
      }

      const data = monthlyJotformData.get(monthKey)!;
      data.submissions++;

      const email = rec['Please enter your email to see your results.']?.toLowerCase().trim();
      if (email) {
        // If this is a new unique email for this month
        if (!data.emails.has(email)) {
          data.emails.add(email);
          // Check if this email converted (became a member)
          if (memberEmails.has(email)) {
            data.conversions++;
          }
        }
      }
    } catch {
      // Skip invalid dates
    }
  });

  const jotformMonthlyBreakdown = Array.from(monthlyJotformData.entries())
    .map(([month, data]) => ({
      month,
      submissions: data.submissions,
      uniqueEmails: data.emails.size,
      conversions: data.conversions,
      conversionRate: data.emails.size > 0 ? (data.conversions / data.emails.size) * 100 : 0
    }))
    .filter(item => item.month >= '2025-04')
    .sort((a, b) => a.month.localeCompare(b.month));
  // ── Onboarding Email Analysis ─────────────────────────────────────────────
  // Onboarding emails started Feb 18, 2026 for ATNS Public members ($5.50/mo)
  // who used the free trial. We narrow to Public + free-trial members so the
  // comparison reflects the exact cohort receiving the email sequence.
  const ONBOARDING_START = new Date('2026-02-18');
  const ONBOARDING_START_STR = 'Feb 18, 2026';

  // Public members who also used the free trial — the targeted cohort
  const publicFreeTrialMembers = accountsData.filter(
    acc =>
      acc['ATNS Public']?.trim() === 'ATNS Public' &&
      freePromoAccountIds.has(acc['Account ID']?.trim())
  );

  const parseJoinDate = (s: string): Date | null => {
    try {
      const d = parse(s.trim(), 'MMM d, yyyy', new Date());
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  };

  const publicBefore = publicFreeTrialMembers.filter(acc => {
    const d = parseJoinDate(acc['Join Date'] ?? '');
    return d !== null && d < ONBOARDING_START;
  });

  const publicAfter = publicFreeTrialMembers.filter(acc => {
    const d = parseJoinDate(acc['Join Date'] ?? '');
    return d !== null && d >= ONBOARDING_START;
  });

  const beforeCanceled = publicBefore.filter(isCanceled).length;
  const afterCanceled = publicAfter.filter(isCanceled).length;
  const overallOnboardingCanceled = publicFreeTrialMembers.filter(isCanceled).length;

  // Monthly breakdown for public free-trial members
  const publicMonthlyMap = new Map<string, { joined: number; canceled: number }>();
  publicFreeTrialMembers.forEach(acc => {
    const d = parseJoinDate(acc['Join Date'] ?? '');
    if (!d) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!publicMonthlyMap.has(key)) publicMonthlyMap.set(key, { joined: 0, canceled: 0 });
    const entry = publicMonthlyMap.get(key)!;
    entry.joined++;
    if (isCanceled(acc)) entry.canceled++;
  });

  const onboardingMonthlyBreakdown = Array.from(publicMonthlyMap.entries())
    .map(([month, data]) => {
      const monthDate = new Date(`${month}-01`);
      return {
        month,
        joined: data.joined,
        canceled: data.canceled,
        active: data.joined - data.canceled,
        cancellationRate: data.joined > 0 ? (data.canceled / data.joined) * 100 : 0,
        isAfterOnboarding: monthDate >= new Date('2026-02-01'),
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));

  const onboardingAnalysis = {
    onboardingStartDate: ONBOARDING_START_STR,
    before: {
      total: publicBefore.length,
      canceled: beforeCanceled,
      active: publicBefore.length - beforeCanceled,
      cancellationRate: publicBefore.length > 0 ? (beforeCanceled / publicBefore.length) * 100 : 0,
    },
    after: {
      total: publicAfter.length,
      canceled: afterCanceled,
      active: publicAfter.length - afterCanceled,
      cancellationRate: publicAfter.length > 0 ? (afterCanceled / publicAfter.length) * 100 : 0,
    },
    overall: {
      total: publicFreeTrialMembers.length,
      canceled: overallOnboardingCanceled,
      active: publicFreeTrialMembers.length - overallOnboardingCanceled,
      cancellationRate: publicFreeTrialMembers.length > 0 ? (overallOnboardingCanceled / publicFreeTrialMembers.length) * 100 : 0,
    },
    monthlyBreakdown: onboardingMonthlyBreakdown,
  };

  // ── Revenue Analysis ───────────────────────────────────────────────────────
  const priceMap = new Map<string, number>();
  financialData.forEach((tx) => {
    const type = tx['Transaction Type'];
    if (type === 'Membership' && parseFloat(tx['Transaction Total'] || '0') > 0) {
      const item = tx.Items || 'Unknown';
      const cost = Math.max(
        parseFloat(tx['Membership Sub-Total'] || '0'),
        parseFloat(tx['Transaction Total'] || '0')
      );
      if (!priceMap.has(item) || priceMap.get(item)! < cost) {
        priceMap.set(item, cost);
      }
    }
  });

  let potentialRevenue = 0;
  let actualRevenue = 0;
  let maxMonthlyRevenue = 0;
  // Evaluate up to April 8, 2026 as per user target
  const evaluationDate = new Date('2026-04-08');

  freePromoAccountIds.forEach((accId) => {
    const txs = financialData.filter((x) => x['Account ID']?.trim() === accId);

    // Find initial free transaction
    const initialTxs = txs.filter((x) => x['Discount Code']?.toLowerCase().trim() === 'free');
    if (initialTxs.length === 0) return;

    // Sort to get earliest
    const sortedInit = initialTxs
      .map((x) => ({ ...x, d: parse(x.Date, 'MMM d, yyyy', new Date()) }))
      .sort((a, b) => a.d.getTime() - b.d.getTime());
    const firstFree = sortedInit[0];

    const items = firstFree.Items || 'Unknown';
    const cleanedItems = items.replace(/,\s*Discount code:.*$/i, '').trim();
    let rate = priceMap.get(cleanedItems) || priceMap.get(items) || 0;

    // Fallback: if we still don't have a rate (or evaluating $0 rate) and it looks like a public membership
    if (rate === 0 && cleanedItems.includes('ATNS Public')) {
      rate = 5.51; // general fallback cost observed in data
    }
    maxMonthlyRevenue += rate;

    const joinDate = firstFree.d;
    // Calculate full months elapsed giving 1 month free (differenceInMonths effectively floors to full months, 
    // users pay for subsequent months)
    let monthsElapsed = differenceInMonths(evaluationDate, joinDate);
    if (monthsElapsed < 0) monthsElapsed = 0;

    potentialRevenue += monthsElapsed * rate;

    // Sum all paid memberships for this user
    txs.forEach((t) => {
      if (parseFloat(t['Transaction Total'] || '0') > 0 && t['Transaction Type'] === 'Membership') {
        const cost = parseFloat(t['Transaction Total'] || '0');
        actualRevenue += cost;
      }
    });
  });

  const year1Perfect = maxMonthlyRevenue * 11;
  const currentChurnRate = freePromoCancellationRate / 100; // it's a percentage (e.g. 50 meaning 50%)
  const year1Current = year1Perfect * (1 - currentChurnRate);

  const simulations: Array<{ label: string; cancellationRate: number; projectedRevenue: number }> = [];
  const testRates = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90].filter(r => Math.abs(r - freePromoCancellationRate) > 1);
  testRates.push(freePromoCancellationRate);
  testRates.sort((a, b) => a - b); // Ensure monotonically increasing

  testRates.forEach(cr => {
    let label = `${cr.toFixed(0)}% Churn`;
    if (cr === 0) label = "0% Churn (Perfect)";
    if (cr === freePromoCancellationRate) label = `Current (${cr.toFixed(1)}%)`;

    simulations.push({
      label,
      cancellationRate: cr,
      projectedRevenue: year1Perfect * (1 - (cr / 100)),
    });
  });

  const revenueAnalysis = {
    potentialRevenue,
    actualRevenue,
    difference: potentialRevenue - actualRevenue,
    userCount: freePromoAccountIds.size,
    projections: {
      maxMonthlyRevenue,
      year1Perfect,
      year1Current,
      simulations,
    }
  };

  return {
    totalMembers,
    activeMembers,
    canceledMembers,
    cancellationRate,

    freePromoStats: {
      totalTransactions: freePromoTransactions.length,
      uniqueUsers: freePromoAccountIds.size,
      canceledUsers: freePromoCanceled,
      activeUsers: freePromoActive,
      cancellationRate: freePromoCancellationRate,
      avgTransactionsPerDay,
      avgUsersPerDay,
      usagePeriodDays,
      firstUsage,
      lastUsage,
      monthlyBreakdown,
    },

    jotformPipeline: {
      totalSubmissions: totalJotformSubmissions,
      uniqueEmails: jotformEmails.size,
      duplicateSubmissions: duplicateJotformSubmissions,
      convertedToMembers,
      conversionRate,
      memberCount: convertedToMembers,
      // Before free trial period (before Aug 6, 2025)
      submissionsBeforeFreeTrial: jotformDataBeforeFreeTrial.length,
      uniqueEmailsBeforeFreeTrial: jotformEmailsBeforeFreeTrial.size,
      convertedBeforeFreeTrial,
      conversionRateBeforeFreeTrial,
      canceledBeforeFreeTrial,
      activeBeforeFreeTrial,
      cancellationRateBeforeFreeTrial,
      netConversionRateBeforeFreeTrial,
      // Free trial period stats (Aug 6, 2025 onward)
      submissionsSinceFreeTrial: jotformDataSinceFreeTrial.length,
      uniqueEmailsSinceFreeTrial: jotformEmailsSinceFreeTrial.size,
      convertedSinceFreeTrial: convertedToMembersSinceFreeTrial,
      conversionRateSinceFreeTrial,
      canceledSinceFreeTrial,
      activeSinceFreeTrial,
      cancellationRateSinceFreeTrial,
      netConversionRateSinceFreeTrial,
      freeTrialUsers: jotformFreeTrialUsers.length,
      paidUsers: jotformPaidUsers,
      freeTrialRate,
      freeTrialCanceled: jotformFreeTrialCanceled,
      freeTrialActive: jotformFreeTrialActive,
      freeTrialCancellationRate: jotformFreeTrialCancellationRate,
      monthlyBreakdown: jotformMonthlyBreakdown,
    },

    memberSources: {
      fromJotform: convertedToMembers,
      notFromJotform: totalMembers - convertedToMembers,
    },

    onboardingAnalysis,
    revenueAnalysis,
  };
}

