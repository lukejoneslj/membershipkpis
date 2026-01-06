'use client';

import { useState } from 'react';
import { FileUploader } from '@/components/FileUploader';
import { Dashboard } from '@/components/Dashboard';
import { parseCSVFile, analyzeData } from '@/lib/dataProcessor';
import type { AccountRecord, FinancialRecord, JotformRecord, AnalysisResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function Home() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesUploaded = async (files: {
    accounts: File | null;
    financial: File | null;
    jotform: File | null;
  }) => {
    if (!files.accounts || !files.financial || !files.jotform) {
      setError('All three files are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Parse all CSV files
      const [accountsData, financialData, jotformData] = await Promise.all([
        parseCSVFile<AccountRecord>(files.accounts),
        parseCSVFile<FinancialRecord>(files.financial),
        parseCSVFile<JotformRecord>(files.jotform),
      ]);

      // Analyze the data
      const result = analyzeData(accountsData, financialData, jotformData);
      setAnalysis(result);
    } catch (err) {
      console.error('Error processing files:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while processing the files');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <h2 className="text-xl font-semibold">Analyzing your data...</h2>
          <p className="text-muted-foreground">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-5xl">⚠️</div>
          <h2 className="text-xl font-semibold">Error Processing Files</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={handleReset}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (analysis) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6">
          <Button
            variant="outline"
            onClick={handleReset}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Upload New Files
          </Button>
          <Dashboard analysis={analysis} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <FileUploader onFilesUploaded={handleFilesUploaded} />
    </div>
  );
}
