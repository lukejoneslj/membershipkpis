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
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart } from 'recharts';
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
    canceled: item.canceledUsers,
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
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
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
                      <span className={`font-bold ${analysis.jotformPipeline.conversionRateSinceFreeTrial > analysis.jotformPipeline.conversionRateBeforeFreeTrial
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
                      <span className={`font-bold ${analysis.jotformPipeline.netConversionRateSinceFreeTrial > analysis.jotformPipeline.netConversionRateBeforeFreeTrial
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
                      <span className={`font-bold ${analysis.jotformPipeline.cancellationRateSinceFreeTrial < analysis.jotformPipeline.cancellationRateBeforeFreeTrial
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

          {/* Monthly Conversion Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Conversion Trend</CardTitle>
              <CardDescription>
                Submissions, Conversions, and Conversion Rate by Month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={analysis.jotformPipeline.monthlyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" unit="%" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="submissions" fill="#94a3b8" name="Submissions" barSize={20} />
                    <Bar yAxisId="left" dataKey="conversions" fill="#8b5cf6" name="New Members" barSize={20} />
                    <Line yAxisId="right" type="monotone" dataKey="conversionRate" stroke="#10b981" name="Conversion Rate" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
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

          {/* Monthly Cancellations Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Free Trial Cancellations</CardTitle>
              <CardDescription>Number of users from each month who have canceled</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="canceled" fill="#ef4444" name="Canceled Users" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Detailed Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Breakdown Data</CardTitle>
              <CardDescription>Detailed view of monthly trial usage and cancellations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted">
                    <tr>
                      <th className="px-6 py-3">Month</th>
                      <th className="px-6 py-3">Transactions</th>
                      <th className="px-6 py-3">Unique Users</th>
                      <th className="px-6 py-3">Canceled Users</th>
                      <th className="px-6 py-3">Cancel Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyChartData.map((row) => (
                      <tr key={row.month} className="border-b">
                        <td className="px-6 py-4 font-medium">{row.month}</td>
                        <td className="px-6 py-4">{row.transactions}</td>
                        <td className="px-6 py-4">{row.users}</td>
                        <td className="px-6 py-4 text-red-600 font-bold">{row.canceled}</td>
                        <td className="px-6 py-4">
                          {row.users > 0 ? ((row.canceled / row.users) * 100).toFixed(1) : '0.0'}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onboarding Tab */}
        <TabsContent value="onboarding" className="space-y-4">

          {/* Before vs After KPI Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Before */}
            <Card className="border-l-4 border-l-slate-400">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Before Feb 18, 2026</CardTitle>
                <CardDescription>No onboarding emails</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Joined</span>
                  <span className="font-bold">{analysis.onboardingAnalysis.before.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Still Active</span>
                  <span className="font-bold text-green-600">{analysis.onboardingAnalysis.before.active}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Canceled</span>
                  <span className="font-bold text-red-600">{analysis.onboardingAnalysis.before.canceled}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">Cancel Rate</span>
                  <Badge variant={analysis.onboardingAnalysis.before.cancellationRate > 30 ? 'destructive' : 'secondary'}>
                    {analysis.onboardingAnalysis.before.cancellationRate.toFixed(1)}%
                  </Badge>
                </div>
                <Progress value={100 - analysis.onboardingAnalysis.before.cancellationRate} className="mt-1" />
                <p className="text-xs text-muted-foreground text-right">
                  {(100 - analysis.onboardingAnalysis.before.cancellationRate).toFixed(1)}% retention
                </p>
              </CardContent>
            </Card>

            {/* After */}
            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Since Feb 18, 2026</CardTitle>
                <CardDescription>With onboarding emails ✉️</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Joined</span>
                  <span className="font-bold">{analysis.onboardingAnalysis.after.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Still Active</span>
                  <span className="font-bold text-green-600">{analysis.onboardingAnalysis.after.active}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Canceled</span>
                  <span className="font-bold text-red-600">{analysis.onboardingAnalysis.after.canceled}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">Cancel Rate</span>
                  <Badge variant={analysis.onboardingAnalysis.after.cancellationRate > 30 ? 'destructive' : 'default'}>
                    {analysis.onboardingAnalysis.after.cancellationRate.toFixed(1)}%
                  </Badge>
                </div>
                <Progress value={100 - analysis.onboardingAnalysis.after.cancellationRate} className="mt-1" />
                <p className="text-xs text-muted-foreground text-right">
                  {(100 - analysis.onboardingAnalysis.after.cancellationRate).toFixed(1)}% retention
                </p>
              </CardContent>
            </Card>

            {/* Delta Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Onboarding Impact</CardTitle>
                <CardDescription>Change in cancel rate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <div className={`text-5xl font-bold ${
                    analysis.onboardingAnalysis.after.cancellationRate < analysis.onboardingAnalysis.before.cancellationRate
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {analysis.onboardingAnalysis.after.cancellationRate < analysis.onboardingAnalysis.before.cancellationRate ? '▼' : '▲'}
                    {Math.abs(analysis.onboardingAnalysis.after.cancellationRate - analysis.onboardingAnalysis.before.cancellationRate).toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {analysis.onboardingAnalysis.after.cancellationRate < analysis.onboardingAnalysis.before.cancellationRate
                      ? 'lower cancellation rate after onboarding'
                      : 'higher cancellation rate after onboarding'}
                  </p>
                </div>
                <Separator />
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>All public members</span>
                    <span className="font-semibold text-foreground">{analysis.onboardingAnalysis.overall.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overall cancel rate</span>
                    <span className="font-semibold text-foreground">{analysis.onboardingAnalysis.overall.cancellationRate.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Cancellation Rate — Public Members</CardTitle>
              <CardDescription>
                Each bar is the % of that month&apos;s new public members who have since canceled.
                <span className="ml-2 inline-flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-sm bg-slate-400" /> Before onboarding
                  <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500 ml-2" /> After onboarding (Feb 18, 2026+)
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analysis.onboardingAnalysis.monthlyBreakdown}
                    margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" angle={-30} textAnchor="end" height={50} />
                    <YAxis unit="%" domain={[0, 100]} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === 'cancellationRate' ? `${value.toFixed(1)}%` : value,
                        name === 'cancellationRate' ? 'Cancel Rate' : name === 'joined' ? 'Joined' : 'Canceled'
                      ]}
                    />
                    <Legend />
                    <Bar
                      dataKey="cancellationRate"
                      name="Cancel Rate"
                      radius={[4, 4, 0, 0]}
                    >
                      {analysis.onboardingAnalysis.monthlyBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.isAfterOnboarding ? '#10b981' : '#94a3b8'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Volume + Cancellations stacked chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Public Member Joins &amp; Cancellations</CardTitle>
              <CardDescription>Raw counts — how many joined and how many of those have since canceled</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={analysis.onboardingAnalysis.monthlyBreakdown}
                    margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" angle={-30} textAnchor="end" height={50} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" unit="%" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="joined" name="Joined" fill="#3b82f6" barSize={18} radius={[4,4,0,0]} />
                    <Bar yAxisId="left" dataKey="canceled" name="Canceled" fill="#ef4444" barSize={18} radius={[4,4,0,0]} />
                    <Line yAxisId="right" type="monotone" dataKey="cancellationRate" name="Cancel Rate" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Breakdown — Public Members</CardTitle>
              <CardDescription>Detailed view of public member cohorts by join month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted">
                    <tr>
                      <th className="px-4 py-3">Month</th>
                      <th className="px-4 py-3">Joined</th>
                      <th className="px-4 py-3">Active</th>
                      <th className="px-4 py-3">Canceled</th>
                      <th className="px-4 py-3">Cancel Rate</th>
                      <th className="px-4 py-3">Onboarding</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.onboardingAnalysis.monthlyBreakdown.map((row) => (
                      <tr key={row.month} className={`border-b ${
                        row.isAfterOnboarding ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                      }`}>
                        <td className="px-4 py-3 font-medium">{row.month}</td>
                        <td className="px-4 py-3">{row.joined}</td>
                        <td className="px-4 py-3 text-green-600 font-semibold">{row.active}</td>
                        <td className="px-4 py-3 text-red-600 font-semibold">{row.canceled}</td>
                        <td className="px-4 py-3">
                          <Badge variant={row.cancellationRate > 30 ? 'destructive' : 'secondary'}>
                            {row.cancellationRate.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {row.isAfterOnboarding ? (
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">✉️ With emails</Badge>
                          ) : (
                            <Badge variant="outline">No emails</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}

