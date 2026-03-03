"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  approveDriver,
  getDriverApplicationDetails,
  rejectDriver,
  type DriverDocumentSide,
} from "@/lib/api/drivers.api";

const formatDate = (value: string | null) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const formatStatus = (value: string) => {
  if (!value) {
    return "Unknown";
  }

  return value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
};

const getStatusClassName = (status: string) => {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "approved" || normalizedStatus === "admin-approved") {
    return "text-green-700 bg-green-700/10 border-green-700/20";
  }

  if (normalizedStatus === "pending") {
    return "text-amber-700 bg-amber-700/10 border-amber-700/20";
  }

  if (normalizedStatus === "rejected") {
    return "text-red-700 bg-red-700/10 border-red-700/20";
  }

  if (normalizedStatus === "onhold" || normalizedStatus === "suspended") {
    return "text-orange-700 bg-orange-700/10 border-orange-700/20";
  }

  return "text-gray-700 bg-gray-700/10 border-gray-700/20";
};

const ImageCard = ({ title, imageUrl }: { title: string; imageUrl: string }) => {
  if (!imageUrl) {
    return (
      <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
        {title}: not available
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border-primary/10 shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">{title}</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <a href={imageUrl} target="_blank" rel="noreferrer" download>
              <Download className="mr-2 size-4" />
              Download
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <img
          src={imageUrl}
          alt={title}
          className="h-105 w-full rounded-md border object-cover transition-transform duration-200 hover:scale-[1.01]"
        />
      </CardContent>
    </Card>
  );
};

const DocumentPair = ({
  title,
  value,
}: {
  title: string;
  value: DriverDocumentSide | null;
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold">{title}</h3>
      {!value ? (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          No document submitted.
        </div>
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          <ImageCard title="Front Side" imageUrl={value.frontSide} />
          <ImageCard title="Back Side" imageUrl={value.backSide} />
        </div>
      )}
    </div>
  );
};

const DriverDetailsSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 @container/main px-4 lg:px-6 mt-2 pb-4">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>

      <Card className="border-border">
        <CardHeader>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={`meta-${index}`} className="rounded-lg border p-3 space-y-2">
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
          <Skeleton className="h-8 w-32" />
        </div>

        <Card className="border-border">
          <CardContent className="grid gap-3 pt-6 xl:grid-cols-2">
            <Skeleton className="h-105 w-full" />
            <Skeleton className="h-105 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function DriverDetailsPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const driverId = params?.id;
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const detailsQuery = useQuery({
    queryKey: ["driver-application-details", driverId],
    queryFn: () => getDriverApplicationDetails(driverId),
    enabled: Boolean(driverId),
  });

  const approveMutation = useMutation({
    mutationFn: approveDriver,
  });

  const rejectMutation = useMutation({
    mutationFn: rejectDriver,
  });

  const handleApprove = async () => {
    if (!driverId) {
      return;
    }

    try {
      await approveMutation.mutateAsync({ driverId });
      await Promise.all([
        detailsQuery.refetch(),
        queryClient.invalidateQueries({ queryKey: ["drivers"] }),
      ]);
      toast.success("Driver approved successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to approve driver.");
    }
  };

  const handleReject = async () => {
    if (!driverId) {
      return;
    }

    const reason = rejectReason.trim();
    if (!reason) {
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        driverId,
        rejectionReason: reason,
      });
      await Promise.all([
        detailsQuery.refetch(),
        queryClient.invalidateQueries({ queryKey: ["drivers"] }),
      ]);
      toast.success("Driver rejected successfully.");
      setIsRejectDialogOpen(false);
      setRejectReason("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reject driver.");
    }
  };

  if (detailsQuery.isLoading) {
    return <DriverDetailsSkeleton />;
  }

  if (detailsQuery.error || !detailsQuery.data?.review) {
    return (
      <div className="px-4 py-8 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Driver details unavailable</CardTitle>
            <CardDescription>
              {detailsQuery.error instanceof Error
                ? detailsQuery.error.message
                : "Unable to load driver application details."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/drivers">Back to drivers</Link>
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

  const review = detailsQuery.data.review;
  const documents = review.documents;
  const isPendingStatus = review.accountStatus.toLowerCase() === "pending";
  const isActionPending = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="flex flex-col gap-4 @container/main px-4 lg:px-6 mt-2 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="outline" asChild>
          <Link href="/dashboard/drivers">
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Badge className={`rounded-full border px-3 py-1 ${getStatusClassName(review.accountStatus)}`}>
            {formatStatus(review.accountStatus)}
          </Badge>

          {isPendingStatus ? (
            <>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleApprove}
                disabled={isActionPending || detailsQuery.isFetching}
              >
                {approveMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setIsRejectDialogOpen(true)}
                disabled={isActionPending || detailsQuery.isFetching}
              >
                {rejectMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Reject
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <Card className="overflow-hidden border-primary/15 pt-0">
        <CardHeader className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent py-4">
          <CardTitle className="text-2xl">Driver Application Details</CardTitle>
          <CardDescription>
            Complete review and document verification data for this driver.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border bg-card p-3">
            <div className="text-xs text-muted-foreground">Driver ID</div>
            <div className="mt-1 text-sm font-medium break-all">{review.driverId || "-"}</div>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <div className="text-xs text-muted-foreground">Account Status</div>
            <div className="mt-1 text-sm font-medium">{formatStatus(review.accountStatus)}</div>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <div className="text-xs text-muted-foreground">Submitted Date</div>
            <div className="mt-1 inline-flex items-center gap-2 text-sm font-medium">
              <CalendarDays className="size-4 text-primary" />
              {formatDate(review.submittedDate)}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <div className="text-xs text-muted-foreground">License Number</div>
            <div className="mt-1 text-sm font-medium">
              {documents.driverLicense?.licenseNumber || "-"}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <div className="text-xs text-muted-foreground">License Expiry</div>
            <div className="mt-1 text-sm font-medium">
              {formatDate(documents.driverLicense?.expiryDate || null)}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <div className="text-xs text-muted-foreground">Registration Number</div>
            <div className="mt-1 text-sm font-medium">
              {documents.vehicleRegistration?.registrationNumber || "-"}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <div className="text-xs text-muted-foreground">Registration Expiry</div>
            <div className="mt-1 text-sm font-medium">
              {formatDate(documents.vehicleRegistration?.registrationExpiryDate || null)}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <div className="text-xs text-muted-foreground">State / Region</div>
            <div className="mt-1 text-sm font-medium">
              {documents.vehicleRegistration?.stateOrRegionOfRegistration || "-"}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-3 md:col-span-2 xl:col-span-4">
            <div className="text-xs text-muted-foreground">Rejection Reason</div>
            <div className="mt-1 text-sm font-medium">
              {review.rejectionReason || "-"}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="documents" className="space-y-3">
        <TabsList className="h-10 rounded-xl border bg-muted/70 p-1">
          <TabsTrigger value="documents" className="rounded-lg px-4">Documents</TabsTrigger>
          <TabsTrigger value="vehicle-photos" className="rounded-lg px-4">Vehicle Photos</TabsTrigger>
          <TabsTrigger value="summary" className="rounded-lg px-4">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <DocumentPair title="Driver License" value={documents.driverLicense} />
          <DocumentPair title="Government ID" value={documents.governmentId} />
          <DocumentPair
            title="Vehicle Registration Document"
            value={documents.vehicleRegistration?.document ?? null}
          />
          <DocumentPair title="Gun License" value={documents.gunLicense} />
        </TabsContent>

        <TabsContent value="vehicle-photos">
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Vehicle Images</CardTitle>
              <CardDescription>Exterior and interior verification photos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 text-base font-semibold">Exterior Images</h3>
                {documents.vehiclePhotos?.exteriorImages?.length ? (
                  <div className="grid gap-3 xl:grid-cols-2">
                    {documents.vehiclePhotos.exteriorImages.map((imageUrl, index) => (
                      <ImageCard
                        key={`ext-${imageUrl}-${index}`}
                        title={`Exterior ${index + 1}`}
                        imageUrl={imageUrl}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                    No exterior images submitted.
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-3 text-base font-semibold">Interior Images</h3>
                {documents.vehiclePhotos?.interiorImages?.length ? (
                  <div className="grid gap-3 xl:grid-cols-2">
                    {documents.vehiclePhotos.interiorImages.map((imageUrl, index) => (
                      <ImageCard
                        key={`int-${imageUrl}-${index}`}
                        title={`Interior ${index + 1}`}
                        imageUrl={imageUrl}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                    No interior images submitted.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Application Summary</CardTitle>
              <CardDescription>Quick status and submitted document checklist.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between rounded-md border bg-card p-3 text-sm">
                <span className="inline-flex items-center gap-2">
                  <FileText className="size-4 text-primary" /> Driver License
                </span>
                <span>{documents.driverLicense ? "Submitted" : "Not Submitted"}</span>
              </div>
              <div className="flex items-center justify-between rounded-md border bg-card p-3 text-sm">
                <span className="inline-flex items-center gap-2">
                  <FileText className="size-4 text-primary" /> Government ID
                </span>
                <span>{documents.governmentId ? "Submitted" : "Not Submitted"}</span>
              </div>
              <div className="flex items-center justify-between rounded-md border bg-card p-3 text-sm">
                <span className="inline-flex items-center gap-2">
                  <FileText className="size-4 text-primary" /> Vehicle Registration
                </span>
                <span>{documents.vehicleRegistration ? "Submitted" : "Not Submitted"}</span>
              </div>
              <div className="flex items-center justify-between rounded-md border bg-card p-3 text-sm">
                <span className="inline-flex items-center gap-2">
                  <FileText className="size-4 text-primary" /> Gun License
                </span>
                <span>{documents.gunLicense ? "Submitted" : "Not Submitted"}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Driver</DialogTitle>
            <DialogDescription>
              Provide a rejection reason. This is required to reject the driver.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="driver-reject-reason">Reason</Label>
            <Input
              id="driver-reject-reason"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Enter rejection reason"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim() || isActionPending || detailsQuery.isFetching}
              onClick={handleReject}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
