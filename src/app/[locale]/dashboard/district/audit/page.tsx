import { Clock, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AuditPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <h1 className="text-2xl font-bold text-foreground">Audit Reports</h1>
      
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5 text-blue-600" />
            Feature Planned
          </CardTitle>
          <CardDescription>
            Downloadable SLA compliance and worker performance reports are scheduled for a future release.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-foreground">
          <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
            <p className="font-semibold flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" />
              Current Status
            </p>
            <p className="text-muted-foreground">Not Implemented. Data aggregation pipelines for worker performance are currently in development.</p>
          </div>
          <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
            <p className="font-semibold text-muted-foreground">Required Integration:</p>
            <p className="text-muted-foreground">Requires completion of the data warehouse sync and integration with the legacy HRMS systems.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
