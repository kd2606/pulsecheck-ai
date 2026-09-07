import { Clock, Map } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function FacilitiesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <h1 className="text-2xl font-bold text-foreground">Facility Mapping</h1>
      
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5 text-blue-600" />
            Feature Planned
          </CardTitle>
          <CardDescription>
            Geospatial view of all PHCs and CHCs in the district is scheduled for an upcoming release.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-foreground">
          <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
            <p className="font-semibold flex items-center gap-2">
              <Map className="size-4 text-muted-foreground" />
              Current Status
            </p>
            <p className="text-muted-foreground">Not Implemented. Geocoding of existing facilities is currently underway.</p>
          </div>
          <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
            <p className="font-semibold text-muted-foreground">Planned Next Step:</p>
            <p className="text-muted-foreground">Integration with Google Maps API and spatial indexing in Firestore for geographic visualization.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
