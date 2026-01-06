'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calendar,
  Mail,
} from 'lucide-react';
import type { AnalysisResult } from '@/lib/types';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FunnelChart } from './FunnelChart';

interface DashboardProps {
  analysis: AnalysisResult;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function Dashboard({ analysis }: DashboardProps) {
  // Prepare chart data
  const monthlyChartData = analysis.freePromoStats.monthlyBreakdown.map(item => ({
    month: item.month,
    transactions: item.transactions,
    users: item.uniqueUsers,
  }));

  const pipelineChartData = [
    { stage: 'Quiz Takers', count: analysis.jotformPipeline.uniqueEmails, retention: 100 },
    { stage: 'Converted', count: analysis.jotformPipeline.convertedToMembers, retention: analysis.jotformPipeline.conversionRate },
    { stage: 'Free Trial', count: analysis.jotformPipeline.freeTrialUsers, retention: analysis.jotformPipeline.freeTrialRate },
    { stage: 'Active', count: analysis.jotformPipeline.freeTrialActive, retention: (analysis.jotformPipeline.freeTrialActive / analysis.jotformPipeline.uniqueEmails) * 100 },
  ];

  // Funnel chart data for free trial period (Aug 6, 2025 onward)
  const freeTrialFunnelData = [
    { 
      name: 'Quiz Takers (Since Aug 6)', 
      value: analysis.jotformPipeline.uniqueEmailsSinceFreeTrial,
      color: '#3b82f6' 
    },
    { 
      name: 'Became Members', 
      value: analysis.jotformPipeline.convertedSinceFreeTrial,
      color: '#8b5cf6' 
    },
    { 
      name: 'Used Free Trial', 
      value: analysis.jotformPipeline.freeTrialUsers,
      color: '#f59e0b' 
    },
    { 
      name: 'Still Active', 
      value: analysis.jotformPipeline.freeTrialActive,
      color: '#10b981' 
    },
  ];

  const memberSourcesData = [
    { name: 'From Jotform', value: analysis.memberSources.fromJotform },
    { name: 'Direct/Other', value: analysis.memberSources.notFromJotform },
  ];

  const retentionData = [
    { name: 'Active', value: analysis.activeMembers, color: '#10b981' },
    { name: 'Canceled', value: analysis.canceledMembers, color: '#ef4444' },
  ];

  return (
    <div className="w-full space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Membership Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive analysis of your marketing and sales pipeline
        </p>
      </div>

      {/* Key Insights Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Conversion Rate</AlertTitle>
          <AlertDescription>
            {analysis.jotformPipeline.conversionRate.toFixed(1)}% of quiz takers become members. 
            {analysis.jotformPipeline.conversionRate < 5 && ' Consider optimizing your quiz-to-member funnel.'}
          </AlertDescription>
        </Alert>
        <Alert variant={analysis.jotformPipeline.freeTrialCancellationRate > 40 ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Free Trial Retention</AlertTitle>
          <AlertDescription>
            {analysis.jotformPipeline.freeTrialCancellationRate.toFixed(1)}% of free trial users cancel.
            {analysis.jotformPipeline.freeTrialCancellationRate > 40 && ' Focus on improving onboarding and value demonstration.'}
          </AlertDescription>
        </Alert>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pipeline">Jotform Pipeline</TabsTrigger>
          <TabsTrigger value="free-trial">Free Trial</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysis.totalMembers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Active: {analysis.activeMembers} | Canceled: {analysis.canceledMembers}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(100 - analysis.cancellationRate).toFixed(1)}%
                </div>
                <Progress value={100 - analysis.cancellationRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quiz Submissions</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analysis.jotformPipeline.totalSubmissions.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analysis.jotformPipeline.uniqueEmails.toLocaleString()} unique emails
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Free Trial Users</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analysis.freePromoStats.uniqueUsers}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analysis.freePromoStats.activeUsers} still active
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Member Sources</CardTitle>
                <CardDescription>Where your members come from</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={memberSourcesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {memberSourcesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Member Retention</CardTitle>
                <CardDescription>Active vs. Canceled members</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={retentionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {retentionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Jotform Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-4">
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertTitle>Free Trial Period Analysis</AlertTitle>
            <AlertDescription>
              Free trial metrics only include quiz submissions from <strong>August 6, 2025</strong> onward, 
              when the free trial offer was launched. Overall quiz metrics include all submissions.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Engagement</CardTitle>
                <CardDescription>All-time statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Submissions</span>
                  <span className="font-bold">{analysis.jotformPipeline.totalSubmissions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Unique Emails</span>
                  <span className="font-bold">{analysis.jotformPipeline.uniqueEmails.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Duplicates</span>
                  <span className="font-bold text-muted-foreground">
                    {analysis.jotformPipeline.duplicateSubmissions.toLocaleString()}
                  </span>
                </div>
                <Separator />
                <div className="text-xs text-muted-foreground">
                  Since Aug 6: {analysis.jotformPipeline.uniqueEmailsSinceFreeTrial.toLocaleString()} emails
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion (Since Aug 6)</CardTitle>
                <CardDescription>Free trial period only</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Became Members</span>
                  <span className="font-bold">{analysis.jotformPipeline.convertedSinceFreeTrial}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Conversion Rate</span>
                  <Badge variant={analysis.jotformPipeline.conversionRateSinceFreeTrial > 5 ? 'default' : 'secondary'}>
                    {analysis.jotformPipeline.conversionRateSinceFreeTrial.toFixed(1)}%
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm">Used Free Trial</span>
                  <span className="font-bold">{analysis.jotformPipeline.freeTrialUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Paid Directly</span>
                  <span className="font-bold">{analysis.jotformPipeline.paidUsers}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Free Trial Retention</CardTitle>
                <CardDescription>Active vs canceled</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Still Active</span>
                  <span className="font-bold text-green-600">
                    {analysis.jotformPipeline.freeTrialActive}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Canceled</span>
                  <span className="font-bold text-red-600">
                    {analysis.jotformPipeline.freeTrialCanceled}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm">Cancel Rate</span>
                  <Badge variant={analysis.jotformPipeline.freeTrialCancellationRate > 40 ? 'destructive' : 'default'}>
                    {analysis.jotformPipeline.freeTrialCancellationRate.toFixed(1)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Before vs After Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Conversion Rate Comparison: Before vs During Free Trial
              </CardTitle>
              <CardDescription>
                How the free trial launch on August 6, 2025 impacted quiz-to-member conversion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Before Free Trial */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Before Aug 6, 2025</h3>
                    <Badge variant="outline">No Free Trial</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Quiz Takers</span>
                        <span className="font-semibold">{analysis.jotformPipeline.uniqueEmailsBeforeFreeTrial.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Gross Members</span>
                        <span className="font-semibold">{analysis.jotformPipeline.convertedBeforeFreeTrial}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Gross Conversion Rate</span>
                        <Badge variant="secondary">
                          {analysis.jotformPipeline.conversionRateBeforeFreeTrial.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Canceled</span>
                        <span className="font-semibold text-red-600">
                          {analysis.jotformPipeline.canceledBeforeFreeTrial}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Cancellation Rate</span>
                        <Badge variant={analysis.jotformPipeline.cancellationRateBeforeFreeTrial > 40 ? 'destructive' : 'default'}>
                          {analysis.jotformPipeline.cancellationRateBeforeFreeTrial.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Net Members</span>
                        <span className="text-2xl font-bold text-green-600">
                          {analysis.jotformPipeline.activeBeforeFreeTrial}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs mt-2">
                        <span className="text-muted-foreground">Net Conversion Rate</span>
                        <Badge>
                          {analysis.jotformPipeline.netConversionRateBeforeFreeTrial.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* During Free Trial */}
                <div className="space-y-4 p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Since Aug 6, 2025</h3>
                    <Badge>With Free Trial</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Quiz Takers</span>
                        <span className="font-semibold">{analysis.jotformPipeline.uniqueEmailsSinceFreeTrial.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Gross Members</span>
                        <span className="font-semibold">{analysis.jotformPipeline.convertedSinceFreeTrial}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Gross Conversion Rate</span>
                        <Badge variant="secondary">
                          {analysis.jotformPipeline.conversionRateSinceFreeTrial.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">Includes:</span>
                        <Badge variant="outline" className="text-xs">
                          {analysis.jotformPipeline.freeTrialUsers} free trial
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {analysis.jotformPipeline.paidUsers} paid
                        </Badge>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Canceled</span>
                        <span className="font-semibold text-red-600">
                          {analysis.jotformPipeline.canceledSinceFreeTrial}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Cancellation Rate</span>
                        <Badge variant={analysis.jotformPipeline.cancellationRateSinceFreeTrial > 40 ? 'destructive' : 'default'}>
                          {analysis.jotformPipeline.cancellationRateSinceFreeTrial.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Net Members</span>
                        <span className="text-2xl font-bold text-green-600">
                          {analysis.jotformPipeline.activeSinceFreeTrial}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs mt-2">
                        <span className="text-muted-foreground">Net Conversion Rate</span>
                        <Badge>
                          {analysis.jotformPipeline.netConversionRateSinceFreeTrial.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Impact Summary */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Free Trial Impact Summary
                </h4>
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Gross Conversion Change</div>
                    <div className="flex items-center gap-2">
                      {analysis.jotformPipeline.conversionRateSinceFreeTrial > analysis.jotformPipeline.conversionRateBeforeFreeTrial ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`font-bold ${
                        analysis.jotformPipeline.conversionRateSinceFreeTrial > analysis.jotformPipeline.conversionRateBeforeFreeTrial 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {(analysis.jotformPipeline.conversionRateSinceFreeTrial - analysis.jotformPipeline.conversionRateBeforeFreeTrial).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Net Conversion Change</div>
                    <div className="flex items-center gap-2">
                      {analysis.jotformPipeline.netConversionRateSinceFreeTrial > analysis.jotformPipeline.netConversionRateBeforeFreeTrial ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`font-bold ${
                        analysis.jotformPipeline.netConversionRateSinceFreeTrial > analysis.jotformPipeline.netConversionRateBeforeFreeTrial 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {(analysis.jotformPipeline.netConversionRateSinceFreeTrial - analysis.jotformPipeline.netConversionRateBeforeFreeTrial).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Cancellation Change</div>
                    <div className="flex items-center gap-2">
                      {analysis.jotformPipeline.cancellationRateSinceFreeTrial < analysis.jotformPipeline.cancellationRateBeforeFreeTrial ? (
                        <TrendingDown className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`font-bold ${
                        analysis.jotformPipeline.cancellationRateSinceFreeTrial < analysis.jotformPipeline.cancellationRateBeforeFreeTrial 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {(analysis.jotformPipeline.cancellationRateSinceFreeTrial - analysis.jotformPipeline.cancellationRateBeforeFreeTrial).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pipeline Funnel Chart */}
          <FunnelChart 
            data={freeTrialFunnelData}
            title="Free Trial Conversion Funnel"
            description="Journey from quiz submission to active member (Aug 6, 2025 onwards)"
          />
        </TabsContent>

        {/* Free Trial Tab */}
        <TabsContent value="free-trial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analysis.freePromoStats.totalTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Unique Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analysis.freePromoStats.uniqueUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Avg Users/Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {analysis.freePromoStats.avgUsersPerDay.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Usage Period</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analysis.freePromoStats.usagePeriodDays}</div>
                <p className="text-xs text-muted-foreground">days</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">First Usage</span>
                    <Badge variant="outline">{analysis.freePromoStats.firstUsage}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Last Usage</span>
                    <Badge variant="outline">{analysis.freePromoStats.lastUsage}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Active Users</span>
                    <span className="font-bold text-green-600">{analysis.freePromoStats.activeUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Canceled Users</span>
                    <span className="font-bold text-red-600">{analysis.freePromoStats.canceledUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Cancellation Rate</span>
                    <Badge variant={analysis.freePromoStats.cancellationRate > 40 ? 'destructive' : 'default'}>
                      {analysis.freePromoStats.cancellationRate.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Free Trial Usage</CardTitle>
              <CardDescription>Transactions and unique users over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="transactions" stroke="#3b82f6" name="Transactions" />
                  <Line type="monotone" dataKey="users" stroke="#10b981" name="Unique Users" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Key Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quiz Conversion */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  {analysis.jotformPipeline.conversionRate < 5 ? (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  )}
                  Quiz to Member Conversion ({analysis.jotformPipeline.conversionRate.toFixed(1)}%)
                </h3>
                <div className="text-sm text-muted-foreground">
                  {analysis.jotformPipeline.conversionRate < 5 ? (
                    <>
                      <p>Your conversion rate is below 5%, which suggests room for improvement. Consider:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Improving quiz result personalization</li>
                        <li>Adding stronger calls-to-action after quiz completion</li>
                        <li>Implementing email nurture sequences for quiz takers</li>
                        <li>Offering time-limited incentives for joining</li>
                      </ul>
                    </>
                  ) : (
                    <p>Your conversion rate is performing well! Continue optimizing to reach 7-10%.</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Free Trial Strategy */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  Free Trial Strategy
                </h3>
                <p className="text-sm text-muted-foreground">
                  {analysis.jotformPipeline.freeTrialRate.toFixed(1)}% of Jotform members use the free trial. 
                  {analysis.jotformPipeline.freeTrialRate < 30 ? (
                    <> This is relatively low - consider promoting the free trial more prominently in your marketing.</>
                  ) : (
                    <> This shows good awareness of the free trial offer.</>
                  )}
                </p>
                <div className="bg-muted p-4 rounded-lg mt-2">
                  <p className="text-sm font-medium">Free Trial Performance:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>{analysis.jotformPipeline.freeTrialActive} users still active ({((analysis.jotformPipeline.freeTrialActive / analysis.jotformPipeline.freeTrialUsers) * 100).toFixed(1)}% retention)</li>
                    <li>Average {analysis.freePromoStats.avgUsersPerDay.toFixed(2)} new free trial users per day</li>
                    <li>{analysis.freePromoStats.usagePeriodDays} days of usage data available</li>
                  </ul>
                </div>
              </div>

              <Separator />

              {/* Retention Concerns */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  {analysis.jotformPipeline.freeTrialCancellationRate > 40 ? (
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  Retention Analysis
                </h3>
                <div className="text-sm text-muted-foreground">
                  <p>
                    {analysis.jotformPipeline.freeTrialCancellationRate.toFixed(1)}% of free trial users from Jotform have canceled.
                    {analysis.jotformPipeline.freeTrialCancellationRate <= 40 && ' This shows good retention!'}
                  </p>
                  {analysis.jotformPipeline.freeTrialCancellationRate > 40 && (
                    <>
                      <p className="mt-2">This is concerning and suggests issues with:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Onboarding experience - are users getting value quickly?</li>
                        <li>Product-market fit - does your service meet their expectations?</li>
                        <li>Pricing strategy - is the transition from free to paid too abrupt?</li>
                        <li>Support and engagement - are you nurturing free trial users effectively?</li>
                      </ul>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* Action Items */}
              <div className="space-y-2">
                <h3 className="font-semibold">Recommended Actions</h3>
                <div className="space-y-3">
                  <Alert>
                    <AlertTitle>Priority 1: Improve Free Trial Retention</AlertTitle>
                    <AlertDescription>
                      Focus on reducing the {analysis.jotformPipeline.freeTrialCancellationRate.toFixed(1)}% cancellation rate 
                      by implementing better onboarding and value demonstration during the trial period.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertTitle>Priority 2: Optimize Quiz Funnel</AlertTitle>
                    <AlertDescription>
                      With only {analysis.jotformPipeline.conversionRate.toFixed(1)}% converting from quiz to member,
                      test different post-quiz nurture sequences and offers to improve conversion.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertTitle>Priority 3: Leverage Success Stories</AlertTitle>
                    <AlertDescription>
                      You have {analysis.memberSources.notFromJotform} members who didn&apos;t come through Jotform.
                      Understand what channels are working and double down on those strategies.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

