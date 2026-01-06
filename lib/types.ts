export interface AccountRecord {
  'Account ID': string;
  'Account Name': string;
  'First Name': string;
  'Last Name': string;
  Email: string;
  Cancel: string;
  'Join Date': string;
  'Renewal Date': string;
  'Billing Method': string;
}

export interface FinancialRecord {
  Date: string;
  Name: string;
  Email: string;
  'Account ID': string;
  'Discount Code': string;
  'Membership Sub-Total': string;
  'Transaction Total': string;
  'Transaction Type': string;
  'Renewal Date Before Transaction': string;
  'Renewal Date After Transaction': string;
}

export interface JotformRecord {
  'Submission Date': string;
  'Please enter your email to see your results.': string;
}

export interface AnalysisResult {
  // Overall Stats
  totalMembers: number;
  activeMembers: number;
  canceledMembers: number;
  cancellationRate: number;
  
  // Free Promo Analysis
  freePromoStats: {
    totalTransactions: number;
    uniqueUsers: number;
    canceledUsers: number;
    activeUsers: number;
    cancellationRate: number;
    avgTransactionsPerDay: number;
    avgUsersPerDay: number;
    usagePeriodDays: number;
    firstUsage: string;
    lastUsage: string;
    monthlyBreakdown: Array<{
      month: string;
      transactions: number;
      uniqueUsers: number;
    }>;
  };
  
  // Jotform Pipeline
  jotformPipeline: {
    totalSubmissions: number;
    uniqueEmails: number;
    duplicateSubmissions: number;
    convertedToMembers: number;
    conversionRate: number;
    memberCount: number;
    // Before free trial period (before Aug 6, 2025)
    submissionsBeforeFreeTrial: number;
    uniqueEmailsBeforeFreeTrial: number;
    convertedBeforeFreeTrial: number;
    conversionRateBeforeFreeTrial: number;
    canceledBeforeFreeTrial: number;
    activeBeforeFreeTrial: number;
    cancellationRateBeforeFreeTrial: number;
    netConversionRateBeforeFreeTrial: number;
    // Free trial period stats (Aug 6, 2025 onward)
    submissionsSinceFreeTrial: number;
    uniqueEmailsSinceFreeTrial: number;
    convertedSinceFreeTrial: number;
    conversionRateSinceFreeTrial: number;
    canceledSinceFreeTrial: number;
    activeSinceFreeTrial: number;
    cancellationRateSinceFreeTrial: number;
    netConversionRateSinceFreeTrial: number;
    freeTrialUsers: number;
    paidUsers: number;
    freeTrialRate: number;
    freeTrialCanceled: number;
    freeTrialActive: number;
    freeTrialCancellationRate: number;
  };
  
  // Member Sources
  memberSources: {
    fromJotform: number;
    notFromJotform: number;
  };
}

