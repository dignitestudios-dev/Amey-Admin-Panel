"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  Car,
  Clock,
  Loader2,
  MapPin,
  Shield,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRideById } from "@/lib/api/rides.api";

const formatDateTime = (value: string) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatStatus = (value: string) => {
  if (!value) {
    return "Unknown";
  }

  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getStatusClassName = (status: string) => {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "completed") {
    return "text-green-700 bg-green-700/10 border-green-700/20";
  }

  if (normalizedStatus === "cancelled") {
    return "text-red-700 bg-red-700/10 border-red-700/20";
  }

  if (normalizedStatus === "in-progress") {
    return "text-amber-700 bg-amber-700/10 border-amber-700/20";
  }

  if (normalizedStatus === "requested" || normalizedStatus === "accepted") {
    return "text-blue-700 bg-blue-700/10 border-blue-700/20";
  }

  return "text-gray-700 bg-gray-700/10 border-gray-700/20";
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

const RideDetailsSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6 mt-2 pb-4">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>

      <Card className="border-border">
        <CardHeader>
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="rounded-lg border p-3 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="h-10 rounded-xl border bg-muted/70 p-1 flex items-center gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Card className="border-border">
          <CardContent className="pt-6 grid gap-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function RideDetailsPage() {
  const params = useParams<{ id: string }>();
  const rideId = params?.id;

  const detailsQuery = useQuery({
    queryKey: ["ride-details", rideId],
    queryFn: () => getRideById(rideId),
    enabled: Boolean(rideId),
  });

  if (detailsQuery.isLoading) {
    return <RideDetailsSkeleton />;
  }

  if (detailsQuery.error || !detailsQuery.data?.ride) {
    return (
      <div className="px-4 py-8 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Ride details unavailable</CardTitle>
            <CardDescription>
              {detailsQuery.error instanceof Error
                ? detailsQuery.error.message
                : "Unable to load ride details."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/rides">Back to rides</Link>
            </Button>
            <Button onClick={() => detailsQuery.refetch()} disabled={detailsQuery.isFetching}>
              {detailsQuery.isFetching && <Loader2 className="mr-2 size-4 animate-spin" />}
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ride = detailsQuery.data.ride;

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6 mt-2 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="outline" asChild>
          <Link href="/dashboard/rides">
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Link>
        </Button>

        <Badge className={`rounded-full border px-3 py-1 ${getStatusClassName(ride.rideStatus)}`}>
          {formatStatus(ride.rideStatus)}
        </Badge>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-2xl">Ride Details</CardTitle>
          <CardDescription>
            Full ride information, passenger details, and route data.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">Ride ID</div>
            <div className="mt-1 text-sm font-medium break-all">{ride.id}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">Ride Type</div>
            <div className="mt-1 text-sm font-medium">{formatStatus(ride.rideCategory)}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">Vehicle Type</div>
            <div className="mt-1 inline-flex items-center gap-2 text-sm font-medium">
              <Car className="size-4 text-primary" />
              {formatStatus(ride.vehicleType)}
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">Ride Security</div>
            <div className="mt-1 inline-flex items-center gap-2 text-sm font-medium">
              <Shield className="size-4 text-primary" />
              {formatStatus(ride.rideSecurity)}
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">Actual Fare</div>
            <div className="mt-1 text-sm font-medium">{formatCurrency(ride.actualFare)}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">Estimated Fare</div>
            <div className="mt-1 text-sm font-medium">{formatCurrency(ride.estimatedFare)}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">Start Time</div>
            <div className="mt-1 inline-flex items-center gap-2 text-sm font-medium">
              <Clock className="size-4 text-primary" />
              {formatDateTime(ride.startTime)}
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">End Time</div>
            <div className="mt-1 inline-flex items-center gap-2 text-sm font-medium">
              <CalendarDays className="size-4 text-primary" />
              {formatDateTime(ride.endTime)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="route" className="space-y-3">
        <TabsList className="h-10 rounded-xl border bg-muted/70 p-1">
          <TabsTrigger value="route" className="rounded-lg px-4">Route</TabsTrigger>
          <TabsTrigger value="passenger" className="rounded-lg px-4">Passenger</TabsTrigger>
          <TabsTrigger value="additional" className="rounded-lg px-4">Additional</TabsTrigger>
        </TabsList>

        <TabsContent value="route">
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="rounded-lg border p-4">
                <div className="text-xs text-muted-foreground">Pickup Point</div>
                <div className="mt-1 inline-flex items-start gap-2 text-sm font-medium">
                  <MapPin className="size-4 mt-0.5 text-primary" />
                  {ride.pickupPoint.placeName}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-xs text-muted-foreground">Drop-Off Point</div>
                <div className="mt-1 inline-flex items-start gap-2 text-sm font-medium">
                  <MapPin className="size-4 mt-0.5 text-primary" />
                  {ride.dropOffPoint.placeName}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-xs text-muted-foreground">Journey Points</div>
                {ride.rideJourneyPoints.length === 0 ? (
                  <div className="mt-1 text-sm">No journey points.</div>
                ) : (
                  <div className="mt-2 space-y-2">
                    {ride.rideJourneyPoints.map((point, index) => (
                      <div key={`${point.placeName}-${index}`} className="text-sm">
                        {index + 1}. {point.placeName} ({point.hasReached ? "Reached" : "Pending"})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="passenger">
          <Card>
            <CardContent className="pt-6">
              {ride.passenger ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">Passenger Name</div>
                    <div className="mt-1 text-sm font-medium">{ride.passenger.fullName}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">Email</div>
                    <div className="mt-1 text-sm font-medium">{ride.passenger.email}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">Phone</div>
                    <div className="mt-1 text-sm font-medium">{ride.passenger.phoneNumber}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">Account Status</div>
                    <div className="mt-1 text-sm font-medium">{formatStatus(ride.passenger.accountStatus)}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">Gender</div>
                    <div className="mt-1 text-sm font-medium">
                      {ride.passenger.genderDescription || formatStatus(ride.passenger.gender)}
                    </div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">Device</div>
                    <div className="mt-1 inline-flex items-center gap-2 text-sm font-medium">
                      <User className="size-4 text-primary" />
                      {ride.passenger.deviceInfo}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                  Passenger information is unavailable.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="additional">
          <Card>
            <CardContent className="pt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Distance</div>
                <div className="mt-1 text-sm font-medium">{ride.rideDistance.toFixed(2)} km</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Ride Duration</div>
                <div className="mt-1 text-sm font-medium">{ride.rideDuration} min</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Additional Duration</div>
                <div className="mt-1 text-sm font-medium">{ride.additionalDuration} min</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Child Car Seat</div>
                <div className="mt-1 text-sm font-medium">{ride.isChildCarSeat ? "Yes" : "No"}</div>
              </div>
              <div className="rounded-lg border p-3 md:col-span-2 xl:col-span-2">
                <div className="text-xs text-muted-foreground">Special Request</div>
                <div className="mt-1 text-sm font-medium">{ride.specialRequest || "-"}</div>
              </div>
              <div className="rounded-lg border p-3 md:col-span-2 xl:col-span-3">
                <div className="text-xs text-muted-foreground">Child Info</div>
                {ride.childInfo.length === 0 ? (
                  <div className="mt-1 text-sm font-medium">No child info.</div>
                ) : (
                  <div className="mt-2 space-y-2">
                    {ride.childInfo.map((child, index) => (
                      <div key={`${child.fullName}-${index}`} className="rounded-md border p-2 text-sm">
                        {child.fullName} • {child.age}y • {formatStatus(child.gender)} • {child.relation}
                        {child.description ? ` • ${child.description}` : ""}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
