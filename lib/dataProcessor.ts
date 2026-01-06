import Papa from 'papaparse';
import { parse, differenceInDays } from 'date-fns';
import type { AccountRecord, FinancialRecord, JotformRecord, AnalysisResult } from './types';

export async function parseCSVFile<T>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as T[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export function analyzeData(
  accountsData: AccountRecord[],
  financialData: FinancialRecord[],
  jotformData: JotformRecord[]
): AnalysisResult {
  // Overall Member Stats
  const totalMembers = accountsData.length;
  const canceledMembers = accountsData.filter(acc => acc.Cancel?.trim() === 'Cancel').length;
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
    .map(([month, data]) => ({
      month,
      transactions: data.transactions,
      uniqueUsers: data.users.size,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
  
  // Check cancellation status for free promo users
  const freePromoCanceled = accountsData.filter(
    acc => freePromoAccountIds.has(acc['Account ID']?.trim()) && acc.Cancel?.trim() === 'Cancel'
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
           acc.Cancel?.trim() === 'Cancel'
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
           acc.Cancel?.trim() === 'Cancel'
  ).length;
  const jotformFreeTrialActive = jotformFreeTrialUsers.length - jotformFreeTrialCanceled;
  const jotformFreeTrialCancellationRate = jotformFreeTrialUsers.length > 0 
    ? (jotformFreeTrialCanceled / jotformFreeTrialUsers.length) * 100 
    : 0;
  
  // Calculate gross vs net for SINCE free trial (all conversions, not just free trial users)
  const canceledSinceFreeTrial = accountsData.filter(
    acc => Array.from(jotformMemberAccountIdsSinceFreeTrial).includes(acc['Account ID']?.trim()) && 
           acc.Cancel?.trim() === 'Cancel'
  ).length;
  const activeSinceFreeTrial = convertedToMembersSinceFreeTrial - canceledSinceFreeTrial;
  const cancellationRateSinceFreeTrial = convertedToMembersSinceFreeTrial > 0
    ? (canceledSinceFreeTrial / convertedToMembersSinceFreeTrial) * 100
    : 0;
  const netConversionRateSinceFreeTrial = jotformEmailsSinceFreeTrial.size > 0
    ? (activeSinceFreeTrial / jotformEmailsSinceFreeTrial.size) * 100
    : 0;
  
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
    },
    
    memberSources: {
      fromJotform: convertedToMembers,
      notFromJotform: totalMembers - convertedToMembers,
    },
  };
}

