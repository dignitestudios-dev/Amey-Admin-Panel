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
  MessageSquare,
  Shield,
  Star,
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
import type {
  RideJourneyPointDetails,
  RideChildInfo,
  RideDriverDetails,
} from "@/lib/api/rides.api";

const formatDateTime = (value: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (value: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const formatStatus = (value: string) => {
  if (!value) return "Unknown";
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getStatusClassName = (status: string) => {
  const s = status.toLowerCase();
  if (s === "completed") return "text-green-700 bg-green-700/10 border-green-700/20";
  if (s === "cancelled") return "text-red-700 bg-red-700/10 border-red-700/20";
  if (s === "in-progress") return "text-amber-700 bg-amber-700/10 border-amber-700/20";
  if (s === "requested" || s === "accepted") return "text-blue-700 bg-blue-700/10 border-blue-700/20";
  return "text-gray-700 bg-gray-700/10 border-gray-700/20";
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

const StarRating = ({ rating, max = 5 }: { rating: number; max?: number }) =>{
  console.log("rating-->",rating)
return(
  <div className="inline-flex items-center gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <Star
        key={i}
        className={`size-4 ${
          i < Math.round(rating)
            ? "fill-amber-400 text-amber-400"
            : "fill-muted text-muted-foreground/30"
        }`}
      />
    ))}
    <span className="ml-1.5 text-sm font-medium">
      {rating > 0 ? rating.toFixed(1) : "No rating"}
    </span>
  </div>
);
} 

const InfoCell = ({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`rounded-lg border p-3 ${className ?? ""}`}>
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="mt-1 text-sm font-medium">{children}</div>
  </div>
);

const RideDetailsSkeleton = () => (
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
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-3 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
    <div className="space-y-3">
      <div className="h-10 rounded-xl border bg-muted/70 p-1 flex items-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24" />
        ))}
      </div>
      <Card className="border-border">
        <CardContent className="pt-6 grid gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    </div>
  </div>
);

export default function RideDetailsPage() {
  const params = useParams<{ id: string }>();
  const rideId = params?.id;

  const detailsQuery = useQuery({
    queryKey: ["ride-details", rideId],
    queryFn: () => getRideById(rideId),
    enabled: Boolean(rideId),
  });

  if (detailsQuery.isLoading) return <RideDetailsSkeleton />;

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
            <Button
              onClick={() => detailsQuery.refetch()}
              disabled={detailsQuery.isFetching}
            >
              {detailsQuery.isFetching && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ride = detailsQuery.data.ride;
  const driver: RideDriverDetails | null | undefined = detailsQuery.data.ride?.driverId;
  const passenger = detailsQuery.data.ride?.passenger;
  const feedback = ride.rideHistory?.feedback;
  const feedbackRating = feedback?.rating ?? 0;
  const feedbackImages = feedback?.images ?? [];

  
  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6 mt-2 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="outline" asChild>
          <Link href="/dashboard/rides">
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Link>
        </Button>
        <Badge
          className={`rounded-full border px-3 py-1 ${getStatusClassName(ride.rideStatus)}`}
        >
          {formatStatus(ride.rideStatus)}
        </Badge>
      </div>

      {/* Overview card */}
      <Card className="overflow-hidden border-primary/15 pt-0">
        <CardHeader className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent py-4">
          <CardTitle className="text-2xl">Ride Details</CardTitle>
          <CardDescription>
            Full ride information, participant details, and route data.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <InfoCell label="Ride ID">
            <span className="break-all">{ride.id}</span>
          </InfoCell>
          <InfoCell label="Ride Type">{formatStatus(ride.rideCategory)}</InfoCell>
          <InfoCell label="Vehicle Type">
            <span className="inline-flex items-center gap-2">
              <Car className="size-4 text-primary" />
              {formatStatus(ride.vehicleType)}
            </span>
          </InfoCell>
          <InfoCell label="Ride Security">
            <span className="inline-flex items-center gap-2">
              <Shield className="size-4 text-primary" />
              {formatStatus(ride.rideSecurity)}
            </span>
          </InfoCell>
          <InfoCell label="Actual Fare">{formatCurrency(ride.actualFare)}</InfoCell>
          <InfoCell label="Estimated Fare">{formatCurrency(ride.estimatedFare)}</InfoCell>
          <InfoCell label="Start Time">
            <span className="inline-flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              {formatDateTime(ride.startTime)}
            </span>
          </InfoCell>
          <InfoCell label="End Time">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              {formatDateTime(ride.endTime)}
            </span>
          </InfoCell>
          <InfoCell label="Passenger ID" className="md:col-span-1 xl:col-span-2">
            <Link 
  href={`/dashboard/users/${passenger?.id}`} 
  className="text-primary underline break-all"
>
  {driver?._id ?? "-"}
</Link>
          </InfoCell>
          <InfoCell label="Driver ID" className="md:col-span-1 xl:col-span-2">
<Link 
  href={`/dashboard/drivers/${driver?._id}`} 
  className="text-primary underline break-all"
>
  {driver?._id ?? "-"}
</Link>          </InfoCell>
          
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="route" className="space-y-3">
        <TabsList className="h-10 rounded-xl border bg-muted/70 p-1 flex-wrap">
          <TabsTrigger value="route" className="rounded-lg cursor-pointer px-4">
            Route
          </TabsTrigger>
          <TabsTrigger value="passenger" className="rounded-lg cursor-pointer px-4">
            Passenger
          </TabsTrigger>
          <TabsTrigger value="driver" className="rounded-lg cursor-pointer   px-4">
            Driver
          </TabsTrigger>
          <TabsTrigger value="additional" className="rounded-lg cursor-pointer px-4">
            Additional
          </TabsTrigger>
          <TabsTrigger value="feedback" className="rounded-lg cursor-pointer px-4">
            Review & Feedback
          </TabsTrigger>
        </TabsList>

        {/* Route */}
        <TabsContent value="route">
          <Card>
            <CardContent className="pt-6 space-y-3">
              <InfoCell label="Pickup Point">
                <span className="inline-flex items-start gap-2">
                  <MapPin className="size-4 mt-0.5 shrink-0 text-primary" />
                  {ride.pickupPoint.placeName}
                </span>
              </InfoCell>
              <InfoCell label="Drop-Off Point">
                <span className="inline-flex items-start gap-2">
                  <MapPin className="size-4 mt-0.5 shrink-0 text-primary" />
                  {ride.dropOffPoint.placeName}
                </span>
              </InfoCell>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Journey Points</div>
                {!ride.rideJourneyPoints?.length ? (
                  <div className="mt-1 text-sm text-muted-foreground">
                    No journey points.
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    {ride.rideJourneyPoints.map((point: RideJourneyPointDetails, index: number) => (
                      <div
                        key={`${point.placeName}-${index}`}
                        className="text-sm"
                      >
                        {index + 1}. {point.placeName} (
                        {point.hasReached ? "Reached" : "Pending"})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Passenger */}
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

        {/* Driver */}
        <TabsContent value="driver">
          <Card>
            <CardContent className="pt-6">
              {driver ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <InfoCell 
  label="Driver ID"
  className="md:col-span-2 xl:col-span-3"
>
  <Link 
    href={`/dashboard/drivers/${driver._id}`} 
    className="text-primary underline break-all"
  >
    {driver._id}
  </Link>
</InfoCell>
                  <InfoCell label="Full Name">{driver.fullName ?? "-"}</InfoCell>
                  <InfoCell label="Email">{driver.email ?? "-"}</InfoCell>
                  <InfoCell label="Phone">{driver.phoneNumber ?? "-"}</InfoCell>
                  <InfoCell label="Account Status">
                    {formatStatus(driver.accountStatus)}
                  </InfoCell>
                  <InfoCell label="Gender">
                    {formatStatus(driver.gender ?? "-")}
                  </InfoCell>
                  <InfoCell label="Date of Birth">
                    {formatDate(driver.dateOfBirth)}
                  </InfoCell>
                  <InfoCell label="Vehicle Type">
                    {formatStatus(driver.vehicleType ?? "-")}
                  </InfoCell>
                  <InfoCell label="Security Option">
                    {formatStatus(driver.rideSecurityOption ?? "-")}
                  </InfoCell>
                  <InfoCell label="Avg Rating">
                    <StarRating rating={driver.avgRating ?? 0} />
                  </InfoCell>
                  <InfoCell label="City">{driver.city ?? "-"}</InfoCell>
                  <InfoCell label="State">{driver.state ?? "-"}</InfoCell>
                  <InfoCell label="Address">{driver.address ?? "-"}</InfoCell>
                  <InfoCell label="Verified">
                    {driver.isVerified ? "Yes" : "No"}
                  </InfoCell>
                  <InfoCell label="Online">
                    {driver.isOnline ? "Online" : "Offline"}
                  </InfoCell>
                  <InfoCell label="Profile Completed">
                    {driver.isProfileCompleted ? "Yes" : "No"}
                  </InfoCell>
                  <InfoCell label="Notifications">
                    {driver.allowNotifications ? "Enabled" : "Disabled"}
                  </InfoCell>
                  <InfoCell
                    label="Enabled Ride Types"
                    className="md:col-span-2 xl:col-span-3"
                  >
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {driver.enabledIncomingRides?.length ? (
                        driver.enabledIncomingRides.map((type: string) => (
                          <span
                            key={type}
                            className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                          >
                            {formatStatus(type)}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </div>
                  </InfoCell>
                  <InfoCell label="Joined">
                    {formatDate(driver.createdAt)}
                  </InfoCell>
                
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                  Driver information is unavailable.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional */}
        <TabsContent value="additional">
          <Card>
            <CardContent className="pt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <InfoCell label="Distance">
                {ride.rideDistance?.toFixed(2)} km
              </InfoCell>
              <InfoCell label="Ride Duration">{ride.rideDuration} min</InfoCell>
              <InfoCell label="Additional Duration">
                {ride.additionalDuration} min
              </InfoCell>
              <InfoCell label="Child Car Seat">
                {ride.isChildCarSeat ? "Yes" : "No"}
              </InfoCell>
              <InfoCell label="State">{ride.state ?? "-"}</InfoCell>
              <InfoCell label="City">{ride.city ?? "-"}</InfoCell>
              <InfoCell
                label="Special Request"
                className="md:col-span-2 xl:col-span-3"
              >
                {ride.specialRequest || "-"}
              </InfoCell>
              <div className="rounded-lg border p-3 md:col-span-2 xl:col-span-3">
                <div className="text-xs text-muted-foreground">Child Info</div>
                {!ride.childInfo?.length ? (
                  <div className="mt-1 text-sm text-muted-foreground">
                    No child info.
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    {ride.childInfo.map((child: RideChildInfo, index: number) => (
                      <div
                        key={`${child.fullName}-${index}`}
                        className="rounded-md border p-2 text-sm"
                      >
                        {child.fullName} • {child.age}y •{" "}
                        {formatStatus(child.gender)} • {child.relation}
                        {child.description ? ` • ${child.description}` : ""}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Review & Feedback */}
        <TabsContent value="feedback">
          <div className="space-y-4">
            {/* Passenger → Driver */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Passenger&apos;s Review of Driver
                </CardTitle>
                <CardDescription>
                  Rating and feedback left by the passenger.
                </CardDescription>
              </CardHeader>
              <CardContent>
              {feedback ? (
  <div className="space-y-3">
    
    {/* ⭐ Rating */}
    <div className="rounded-lg border p-4">
      <div className="text-xs text-muted-foreground mb-2">
        Rating
      </div>

      {/* Stars */}
      <StarRating rating={feedbackRating} />
    </div>

    {/* 📝 Feedback */}
    <div className="rounded-lg border p-4">
      <div className="text-xs text-muted-foreground mb-1">
        Feedback
      </div>
      <p className="text-sm">
        {feedback.description || "-"}
      </p>
    </div>

   <div className="rounded-lg border p-4">
  <div className="text-xs text-muted-foreground mb-1">
    Images
  </div>

  {feedbackImages.length > 0 ? (
    <div className="flex gap-2 flex-wrap">
      {feedbackImages.map((img, index) => (
        <img
          key={index}
          src={img}
          alt={`Feedback ${index}`}
          className="rounded-md h-24 w-24 object-cover"
        />
      ))}
    </div>
  ) : (
    <p className="text-sm">-</p>
  )}
</div>

  </div>
) : (
  <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground flex items-center gap-2">
    <MessageSquare className="size-4 shrink-0" />
    No feedback available.
  </div>
)}
              </CardContent>
            </Card>

            {/* Driver → Passenger */}
            {/* <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Driver&apos;s Review of Passenger
                </CardTitle>
                <CardDescription>
                  Rating and feedback left by the driver.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ride.driverReview ? (
                  <div className="space-y-3">
                    <div className="rounded-lg border p-4">
                      <div className="text-xs text-muted-foreground mb-2">
                        Rating
                      </div>
                      <StarRating rating={ride.driverReview.rating ?? 0} />
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-xs text-muted-foreground mb-1">
                        Feedback
                      </div>
                      <p className="text-sm">
                        {ride.driverReview.feedback || "-"}
                      </p>
                    </div>
                    {ride.driverReview.createdAt && (
                      <InfoCell label="Submitted At">
                        {formatDateTime(ride.driverReview.createdAt)}
                      </InfoCell>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="size-4 shrink-0" />
                    No review submitted by the driver.
                  </div>
                )}
              </CardContent>
            </Card> */}

            {/* Driver overall rating */}
            {driver && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Driver Overall Rating
                  </CardTitle>
                  <CardDescription>
                    Driver&apos;s average rating across all rides.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border p-4">
                    <div className="text-xs text-muted-foreground mb-2">
                      Average Rating
                    </div>
                    <StarRating rating={driver.avgRating ?? 0} />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}