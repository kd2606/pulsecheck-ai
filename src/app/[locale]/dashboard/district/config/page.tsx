import { Clock, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ConfigPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <h1 className="text-2xl font-bold text-foreground">System Config</h1>
      
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5 text-blue-600" />
            Feature Planned
          </CardTitle>
          <CardDescription>
            Global triage thresholds and SLA time limits configuration will be available in a future update.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-foreground">
          <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
            <p className="font-semibold flex items-center gap-2">
              <Settings className="size-4 text-muted-foreground" />
              Current Status
            </p>
            <p className="text-muted-foreground">Not Implemented. Configuration is currently hardcoded in the deployment environment variables.</p>
          </div>
          <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
            <p className="font-semibold text-muted-foreground">Planned Next Step:</p>
            <p className="text-muted-foreground">Migrate static thresholds to the centralized Firebase Remote Config module for real-time updates.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
