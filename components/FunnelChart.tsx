'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FunnelStage {
  name: string;
  value: number;
  color: string;
}

interface FunnelChartProps {
  data: FunnelStage[];
  title?: string;
  description?: string;
}

export function FunnelChart({ data, title, description }: FunnelChartProps) {
  const maxValue = data[0]?.value || 1;
  
  return (
    <Card>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-3">
          {data.map((stage, index) => {
            const percentage = (stage.value / maxValue) * 100;
            const dropoff = index > 0 
              ? ((data[index - 1].value - stage.value) / data[index - 1].value) * 100 
              : 0;
            const retentionFromPrevious = index > 0
              ? (stage.value / data[index - 1].value) * 100
              : 100;
            
            return (
              <div key={stage.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div 
                      className="h-16 rounded-lg flex items-center justify-center font-semibold text-white transition-all hover:opacity-90"
                      style={{ 
                        backgroundColor: stage.color,
                        width: `${Math.max(percentage, 15)}%`,
                        minWidth: '120px'
                      }}
                    >
                      <span className="text-sm px-3">{stage.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold">{stage.value.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}% of total
                        </div>
                      </div>
                      {index > 0 && (
                        <div className="flex gap-2">
                          <Badge variant={retentionFromPrevious > 50 ? 'default' : 'destructive'}>
                            {retentionFromPrevious.toFixed(1)}% retained
                          </Badge>
                          {dropoff > 0 && (
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              -{dropoff.toFixed(1)}% drop
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {index < data.length - 1 && (
                  <div className="flex items-center gap-2 ml-4">
                    <div className="w-0.5 h-4 bg-muted-foreground/30" />
                    <span className="text-xs text-muted-foreground">
                      {data[index + 1].value.toLocaleString()} continue to next stage
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Summary */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">Starting</div>
              <div className="text-xl font-bold">{data[0]?.value.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Ending</div>
              <div className="text-xl font-bold">{data[data.length - 1]?.value.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Overall Conversion</div>
              <div className="text-xl font-bold">
                {((data[data.length - 1]?.value / data[0]?.value) * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Drop-off</div>
              <div className="text-xl font-bold text-red-600">
                {(data[0]?.value - data[data.length - 1]?.value).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

