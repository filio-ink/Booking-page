import { AvailabilityGrid } from "@/components/dashboard/AvailabilityGrid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AvailabilityPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Availability</h1>
      <p className="text-muted-foreground mb-8">
        Set the days and hours when guests can book meetings with you.
      </p>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly schedule</CardTitle>
          <CardDescription>
            Choose your timezone and set available hours for each day.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AvailabilityGrid />
        </CardContent>
      </Card>
    </div>
  );
}
