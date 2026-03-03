"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Ban,
  CalendarDays,
  Eye,
  Laptop,
  Loader2,
  Mail,
  Phone,
  Play,
  Shield,
  Sparkles,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getPassengerDetails,
  togglePassengerRestrict,
  type PassengerRideHistory,
} from "@/lib/api/users.api";

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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

const getInitials = (name: string) => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (parts[0]?.slice(0, 2) || "P").toUpperCase();
};

const formatStatus = (value: string) => {
  if (!value) {
    return "Unknown";
  }

  return value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
};

const getStatusClassName = (status: string) => {
  const normalizedStatus = status.toLowerCase();
  if (normalizedStatus === "completed") {
    return "text-green-700 bg-green-700/10 border-green-700/20";
  }
  if (normalizedStatus === "cancelled" || normalizedStatus === "canceled") {
    return "text-red-700 bg-red-700/10 border-red-700/20";
  }
  if (normalizedStatus === "approved") {
    return "text-green-700 bg-green-700/10 border-green-700/20";
  }
  if (normalizedStatus === "pending") {
    return "text-amber-700 bg-amber-700/10 border-amber-700/20";
  }
  if (normalizedStatus === "rejected") {
    return "text-red-700 bg-red-700/10 border-red-700/20";
  }
  if (normalizedStatus === "deleted" || normalizedStatus === "onhold") {
    return "text-orange-700 bg-orange-700/10 border-orange-700/20";
  }
  return "text-gray-700 bg-gray-700/10 border-gray-700/20";
};

const PassengerDetailsSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 @container/main px-4 lg:px-6 mt-2 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Skeleton className="h-10 w-28 rounded-md" />
        <Skeleton className="h-10 w-44 rounded-md" />
      </div>

      <Card className="overflow-hidden border-border">
        <CardHeader className="bg-muted/40">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
        </CardHeader>

        <CardContent className="grid gap-3 pt-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`top-info-${index}`} className="rounded-lg border bg-card p-3 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="h-10 rounded-xl border bg-muted/70 p-1 flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>

        <Card className="border-border">
          <CardContent className="grid gap-3 pt-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={`overview-${index}`} className="rounded-lg border bg-card p-4 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function PassengerDetailsPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const passengerId = params?.id;
  const [selectedRide, setSelectedRide] = useState<PassengerRideHistory | null>(null);
  const [isRideDialogOpen, setIsRideDialogOpen] = useState(false);

  const detailsQuery = useQuery({
    queryKey: ["passenger-details", passengerId],
    queryFn: () => getPassengerDetails(passengerId),
    enabled: Boolean(passengerId),
  });

  const toggleRestrictMutation = useMutation({
    mutationFn: togglePassengerRestrict,
  });

  const passenger = detailsQuery.data?.passenger;
  const profile = passenger?.profile;
  const normalizedAccountStatus = profile?.accountStatus?.toLowerCase() ?? "";
  const canToggleRestriction =
    normalizedAccountStatus === "approved" || normalizedAccountStatus === "onhold";
  const isOnHoldStatus = normalizedAccountStatus === "onhold";

  const handleToggleRestrict = async () => {
    if (!profile || !canToggleRestriction) {
      return;
    }

    const nextRestrictionState = normalizedAccountStatus === "approved";

    try {
      await toggleRestrictMutation.mutateAsync({
        passengerID: profile.id,
        isRestricted: nextRestrictionState,
      });

      await Promise.all([
        detailsQuery.refetch(),
        queryClient.invalidateQueries({ queryKey: ["passengers"] }),
      ]);

      toast.success(
        nextRestrictionState
          ? "Passenger restricted successfully."
          : "Passenger unrestricted successfully.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update passenger status.",
      );
    }
  };

  const handleViewRide = (ride: PassengerRideHistory) => {
    setSelectedRide(ride);
    setIsRideDialogOpen(true);
  };

  if (detailsQuery.isLoading) {
    return <PassengerDetailsSkeleton />;
  }

  if (detailsQuery.error || !passenger || !profile) {
    return (
      <div className="px-4 py-8 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Passenger details unavailable</CardTitle>
            <CardDescription>
              {detailsQuery.error instanceof Error
                ? detailsQuery.error.message
                : "Unable to load passenger details."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/users">Back to passengers</Link>
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

  return (
    <div className="flex flex-col gap-4 @container/main px-4 lg:px-6 mt-2 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="outline" asChild>
          <Link href="/dashboard/users">
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Link>
        </Button>

        {canToggleRestriction ? (
          <Button
            variant="default"
            className={
              isOnHoldStatus
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }
            onClick={handleToggleRestrict}
            disabled={toggleRestrictMutation.isPending || detailsQuery.isFetching}
          >
            {toggleRestrictMutation.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : isOnHoldStatus ? (
              <Play className="mr-2 size-4" />
            ) : (
              <Ban className="mr-2 size-4" />
            )}
            {isOnHoldStatus ? "Unrestrict Passenger" : "Restrict Passenger"}
          </Button>
        ) : null}
      </div>

      <Card className="overflow-hidden border-primary/15 pt-0">
        <CardHeader className="bg-linear-to-r from-primary/10 py-4 via-primary/5 to-transparent">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-16 border-2 border-primary/20">
                {profile.profileImageUrl ? (
                  <AvatarImage src={profile.profileImageUrl} alt={profile.fullName} />
                ) : null}
                <AvatarFallback className="text-sm font-semibold">
                  {getInitials(profile.fullName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{profile.fullName}</CardTitle>
                <CardDescription>Passenger profile and activity details</CardDescription>
              </div>
            </div>
            <Badge className={`rounded-full border px-3 py-1 ${getStatusClassName(profile.accountStatus)}`}>
              {formatStatus(profile.accountStatus)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="grid gap-3 pt-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border bg-card p-3">
            <div className="text-xs text-muted-foreground">Email</div>
            <div className="mt-1 inline-flex items-center gap-2 text-sm font-medium">
              <Mail className="size-4 text-primary" />
              {profile.email}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <div className="text-xs text-muted-foreground">Phone</div>
            <div className="mt-1 inline-flex items-center gap-2 text-sm font-medium">
              <Phone className="size-4 text-primary" />
              {profile.phoneNumber}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <div className="text-xs text-muted-foreground">Wallet Balance</div>
            <div className="mt-1 inline-flex items-center gap-2 text-sm font-medium">
              <Wallet className="size-4 text-primary" />
              {formatCurrency(profile.walletBalance)}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <div className="text-xs text-muted-foreground">Joined</div>
            <div className="mt-1 inline-flex items-center gap-2 text-sm font-medium">
              <CalendarDays className="size-4 text-primary" />
              {formatDateTime(profile.createdAt)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-3">
        <TabsList className="h-10 rounded-xl border bg-muted/70 p-1">
          <TabsTrigger value="overview" className="rounded-lg px-4">Overview</TabsTrigger>
          <TabsTrigger value="rides" className="rounded-lg px-4">Ride History</TabsTrigger>
          <TabsTrigger value="reviews" className="rounded-lg px-4">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="border-primary/10">
            <CardContent className="grid gap-3 pt-6 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-lg border bg-primary/5 p-4">
                <div className="text-xs text-muted-foreground">Account Status</div>
                <div className="mt-2">
                  <Badge className={`rounded-full border ${getStatusClassName(profile.accountStatus)}`}>
                    {formatStatus(profile.accountStatus)}
                  </Badge>
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-xs text-muted-foreground">Gender</div>
                <div className="mt-2 inline-flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="size-4 text-primary" />
                  {profile.genderDescription || formatStatus(profile.gender)}
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-xs text-muted-foreground">Session Device</div>
                <div className="mt-2 inline-flex items-center gap-2 text-sm font-medium">
                  <Laptop className="size-4 text-primary" />
                  {profile.deviceInfo || "-"}
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-xs text-muted-foreground">Notifications</div>
                <div className="mt-2 inline-flex items-center gap-2 text-sm font-medium">
                  <Shield className="size-4 text-primary" />
                  {profile.allowNotifications ? "Enabled" : "Disabled"}
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-xs text-muted-foreground">Total Spent</div>
                <div className="mt-2 text-base font-semibold text-primary">{formatCurrency(passenger.totalSpent)}</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-xs text-muted-foreground">Updated At</div>
                <div className="mt-2 text-sm font-medium">{formatDateTime(profile.updatedAt)}</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rides">
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Ride History</CardTitle>
              <CardDescription>{passenger.rideHistory.length} rides found</CardDescription>
            </CardHeader>
            <CardContent>
              {passenger.rideHistory.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No ride history available.
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead>Status</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Pickup</TableHead>
                        <TableHead>Drop Off</TableHead>
                        <TableHead className="text-right">Fare</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {passenger.rideHistory.map((ride) => (
                        <TableRow key={ride.id || `${ride.rideId}-${ride.createdAt}`} className="hover:bg-muted/40">
                          <TableCell>
                            <Badge className={`rounded-full border ${getStatusClassName(ride.rideStatus)}`}>
                              {formatStatus(ride.rideStatus)}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatStatus(ride.rideCategory)}</TableCell>
                          <TableCell>{ride.driverName}</TableCell>
                          <TableCell className="max-w-56 truncate">{ride.pickupPointName}</TableCell>
                          <TableCell className="max-w-56 truncate">{ride.dropOffPointName}</TableCell>
                          <TableCell className="text-right">{formatCurrency(ride.actualFare)}</TableCell>
                          <TableCell>{formatDateTime(ride.startTime)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleViewRide(ride)}
                              title="View ride details"
                            >
                              <Eye className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
              <CardDescription>{passenger.reviews.length} reviews found</CardDescription>
            </CardHeader>
            <CardContent>
              {passenger.reviews.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No reviews available.
                </div>
              ) : (
                <div className="grid gap-3">
                  {passenger.reviews.map((review) => (
                    <div key={review.id || `${review.driverId}-${review.createdAt}`} className="rounded-lg border bg-card p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="inline-flex items-center gap-2">
                          <Badge className="rounded-full border text-gray-700 bg-gray-700/10 border-gray-700/20">
                            {formatStatus(review.type)}
                          </Badge>
                          <span className="text-sm font-medium">Rating: {review.rating}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDateTime(review.createdAt)}</span>
                      </div>

                      <p className="mt-3 text-sm">{review.description || "-"}</p>

                      {review.images.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                          {review.images.map((imageUrl, index) => (
                            <a
                              key={`${review.id}-${imageUrl}-${index}`}
                              href={imageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="group relative block h-24 overflow-hidden rounded-md border bg-muted"
                              title={`Review image ${index + 1}`}
                            >
                              <div
                                className="h-full w-full bg-cover bg-center transition-transform duration-200 group-hover:scale-105"
                                style={{ backgroundImage: `url(${imageUrl})` }}
                              />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isRideDialogOpen} onOpenChange={setIsRideDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Ride Details</DialogTitle>
            <DialogDescription>
              Complete ride information for the selected trip.
            </DialogDescription>
          </DialogHeader>

          {selectedRide ? (
            <div className="space-y-4">
              <div className="rounded-xl border bg-linear-to-r from-primary/10 to-transparent p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge className={`rounded-full border ${getStatusClassName(selectedRide.rideStatus)}`}>
                      {formatStatus(selectedRide.rideStatus)}
                    </Badge>
                    <Badge className="rounded-full border text-primary bg-primary/10 border-primary/20">
                      {formatStatus(selectedRide.rideCategory)}
                    </Badge>
                  </div>
                  <div className="text-sm font-semibold text-primary">
                    {formatCurrency(selectedRide.actualFare)}
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Start: {formatDateTime(selectedRide.startTime)}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border bg-card p-3 md:col-span-2">
                  <div className="text-xs text-muted-foreground">Route</div>
                  <div className="mt-2 space-y-2">
                    <div>
                      <div className="text-[11px] text-muted-foreground">Pickup</div>
                      <div className="text-sm font-medium">{selectedRide.pickupPointName}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground">Drop Off</div>
                      <div className="text-sm font-medium">{selectedRide.dropOffPointName}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Driver</div>
                  <div className="mt-2 text-sm font-medium">{selectedRide.driverName}</div>
                  <div className="text-xs text-muted-foreground">{selectedRide.driverPhoneNumber}</div>
                  <div className="text-xs text-muted-foreground">{selectedRide.driverEmail}</div>
                  <div className="mt-2 text-xs text-muted-foreground">Rating: {selectedRide.driverRating}</div>
                  <div className="text-xs text-muted-foreground">City: {selectedRide.driverCity}</div>
                </div>

                <div className="rounded-lg border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Vehicle</div>
                  <div className="mt-2 text-sm font-medium">{selectedRide.vehicleModel}</div>
                  <div className="text-xs text-muted-foreground">Plate: {selectedRide.vehiclePlateNumber}</div>
                  <div className="text-xs text-muted-foreground">Body: {selectedRide.vehicleBodyType}</div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Ride Security: {formatStatus(selectedRide.rideSecurity)}
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Charges</div>
                  <div className="mt-2 text-sm">Fare: <span className="font-medium">{formatCurrency(selectedRide.actualFare)}</span></div>
                  <div className="text-sm">Cancellation: <span className="font-medium">{formatCurrency(selectedRide.cancellationFee)}</span></div>
                  <div className="text-sm">Tip: <span className="font-medium">{formatCurrency(selectedRide.tipPaid)}</span></div>
                </div>

                <div className="rounded-lg border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Time & Distance</div>
                  <div className="mt-2 text-sm">Distance: <span className="font-medium">{selectedRide.rideDistance.toFixed(2)} km</span></div>
                  <div className="text-sm">Duration: <span className="font-medium">{selectedRide.rideDuration.toFixed(2)} mins</span></div>
                  <div className="text-sm">Additional: <span className="font-medium">{selectedRide.additionalDuration.toFixed(2)} mins</span></div>
                  <div className="mt-2 text-xs text-muted-foreground">End: {formatDateTime(selectedRide.endTime)}</div>
                  <div className="text-xs text-muted-foreground">Updated: {formatDateTime(selectedRide.updatedAt)}</div>
                </div>

                <div className="rounded-lg border bg-card p-3 md:col-span-2">
                  <div className="text-xs text-muted-foreground">Special Request</div>
                  <div className="mt-1 text-sm font-medium">{selectedRide.specialRequest || "-"}</div>
                </div>
                <div className="rounded-lg border bg-card p-3 md:col-span-2">
                  <div className="text-xs text-muted-foreground">Feedback</div>
                  <div className="mt-1 text-sm font-medium">{selectedRide.feedback || "-"}</div>
                </div>
                <div className="rounded-lg border bg-card p-3 md:col-span-2">
                  <div className="text-xs text-muted-foreground">Cancellation Reason</div>
                  <div className="mt-1 text-sm font-medium">{selectedRide.cancellationReason || "-"}</div>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
 