'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  onFilesUploaded: (files: {
    accounts: File | null;
    financial: File | null;
    jotform: File | null;
  }) => void;
}

export function FileUploader({ onFilesUploaded }: FileUploaderProps) {
  const [files, setFiles] = useState<{
    accounts: File | null;
    financial: File | null;
    jotform: File | null;
  }>({
    accounts: null,
    financial: null,
    jotform: null,
  });

  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (type: 'accounts' | 'financial' | 'jotform', file: File | null) => {
    if (file && !file.name.endsWith('.csv')) {
      setError('Please upload only CSV files');
      return;
    }
    setError(null);
    setFiles(prev => ({ ...prev, [type]: file }));
  };

  const handleSubmit = () => {
    if (!files.accounts || !files.financial || !files.jotform) {
      setError('Please upload all three CSV files');
      return;
    }
    onFilesUploaded(files);
  };

  const allFilesUploaded = files.accounts && files.financial && files.jotform;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-6 h-6" />
          Upload CSV Files
        </CardTitle>
        <CardDescription>
          Upload the three CSV files to analyze your membership and marketing pipeline
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Accounts CSV */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            {files.accounts ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            Account Data
          </label>
          <div className="flex gap-2">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileChange('accounts', e.target.files?.[0] || null)}
              className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
            />
            {files.accounts && (
              <span className="text-sm text-muted-foreground self-center">
                {files.accounts.name}
              </span>
            )}
          </div>
        </div>

        {/* Financial CSV */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            {files.financial ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            Financial Data
          </label>
          <div className="flex gap-2">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileChange('financial', e.target.files?.[0] || null)}
              className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
            />
            {files.financial && (
              <span className="text-sm text-muted-foreground self-center">
                {files.financial.name}
              </span>
            )}
          </div>
        </div>

        {/* Jotform CSV */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            {files.jotform ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            Jotform Data
          </label>
          <div className="flex gap-2">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileChange('jotform', e.target.files?.[0] || null)}
              className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
            />
            {files.jotform && (
              <span className="text-sm text-muted-foreground self-center">
                {files.jotform.name}
              </span>
            )}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!allFilesUploaded}
          className="w-full"
          size="lg"
        >
          Analyze Data
        </Button>
      </CardContent>
    </Card>
  );
}

