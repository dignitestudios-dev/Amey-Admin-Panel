"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Loader2,
  Plus,
  Send,
} from "lucide-react";
import { toast } from "sonner";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  createNotification,
  getNotifications,
  type NotificationItem,
} from "@/lib/api/notifications.api";

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

const NotificationsTableSkeleton = () => (
  <Card className="border-primary/10">
    <CardHeader className="pb-3">
      <Skeleton className="h-5 w-52" />
      <Skeleton className="h-4 w-72" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-[360px] w-full" />
    </CardContent>
  </Card>
);

const truncateText = (value: string, maxLength: number) => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}...`;
};

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  const notificationsQuery = useQuery({
    queryKey: ["notifications", page, limit],
    queryFn: () => getNotifications({ page, limit }),
    placeholderData: (previousData) => previousData,
  });

  const createNotificationMutation = useMutation({
    mutationFn: createNotification,
    onSuccess: async () => {
      toast.success("Notification sent successfully.");
      setIsCreateOpen(false);
      setTitle("");
      setMessage("");
      setFormError(null);
      await notificationsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to send notification.");
    },
  });

  const notifications = notificationsQuery.data?.notifications ?? [];
  const pagination = notificationsQuery.data?.pagination;

  const totalMessages = pagination?.total ?? notifications.length;

  const canGoPrev = page > 1;
  const canGoNext = page < (pagination?.totalPages ?? 1);

  const handleCreateNotification = () => {
    const sanitizedTitle = title.trim();
    const sanitizedMessage = message.trim();

    if (!sanitizedTitle || !sanitizedMessage) {
      setFormError("Title and message are required.");
      return;
    }

    setFormError(null);
    createNotificationMutation.mutate({
      title: sanitizedTitle,
      message: sanitizedMessage,
    });
  };

  const handleViewNotification = (notification: NotificationItem) => {
    setSelectedNotification(notification);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 @container/main px-4 lg:px-6 mt-2 pb-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and review admin broadcast notifications.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="inline-flex items-center gap-2">
              <Plus className="size-4" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Notification</DialogTitle>
              <DialogDescription>
                Send a notification to users from the admin panel.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notification-title">Title</Label>
                <Input
                  id="notification-title"
                  value={title}
                  maxLength={120}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Enter notification title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification-message">Message</Label>
                <Textarea
                  id="notification-message"
                  value={message}
                  maxLength={500}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Type notification message"
                  rows={5}
                />
              </div>

              {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateNotification}
                disabled={createNotificationMutation.isPending}
              >
                {createNotificationMutation.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Send className="mr-2 size-4" />
                )}
                Send Notification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="border-primary/10 transition-colors hover:border-primary/30">
          <CardHeader className="pb-2">
            <CardDescription>Total Notifications</CardDescription>
            <CardTitle className="text-2xl">{totalMessages}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground inline-flex items-center gap-2">
            <Bell className="size-3.5 text-primary" />
            Stored notifications
          </CardContent>
        </Card>
      </div>

      {notificationsQuery.isLoading && !notificationsQuery.data ? (
        <NotificationsTableSkeleton />
      ) : (
        <Card className="border-primary/10">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Sent Notifications</CardTitle>
                <CardDescription>
                  Notification history with title, message, and created time.
                </CardDescription>
              </div>
              <div className="text-xs text-muted-foreground">
                Total records: {pagination?.total ?? notifications.length}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {notificationsQuery.error ? (
              <div className="rounded-lg border border-destructive/20 p-8 text-center text-sm text-destructive">
                {notificationsQuery.error instanceof Error
                  ? notificationsQuery.error.message
                  : "Unable to load notifications."}
              </div>
            ) : notifications.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No notifications available.
              </div>
            ) : (
              <div className="rounded-md overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50 rounded-2xl!">
                      <TableRow className="h-16 border-none rounded-2xl!">
                        <TableHead className="min-w-[220px]">Title</TableHead>
                        <TableHead className="min-w-[420px]">Message</TableHead>
                        <TableHead className="min-w-[170px] text-right">Created At</TableHead>
                        <TableHead className="w-[100px] text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notifications.map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium">
                            <span className="block max-w-[260px] truncate" title={item.title || "-"}>
                              {truncateText(item.title || "-", 45)}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <span className="block max-w-[520px] truncate" title={item.message || "-"}>
                              {truncateText(item.message || "-", 95)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-sm">{formatDateTime(item.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8"
                              onClick={() => handleViewNotification(item)}
                            >
                              <Eye className="mr-1 size-4" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                Page {pagination?.page ?? page} of {pagination?.totalPages ?? 1}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows:</span>
                <Select
                  value={String(limit)}
                  onValueChange={(value) => {
                    setLimit(Number(value));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  className="size-8 p-0"
                  title="First page"
                  onClick={() => setPage(1)}
                  disabled={!canGoPrev || notificationsQuery.isFetching}
                >
                  <ChevronsLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="size-8 p-0"
                  title="Previous page"
                  onClick={() => setPage((previousPage) => Math.max(1, previousPage - 1))}
                  disabled={!canGoPrev || notificationsQuery.isFetching}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="size-8 p-0"
                  title="Next page"
                  onClick={() =>
                    setPage((previousPage) =>
                      Math.min(pagination?.totalPages ?? previousPage + 1, previousPage + 1),
                    )
                  }
                  disabled={!canGoNext || notificationsQuery.isFetching}
                >
                  <ChevronRight className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="size-8 p-0"
                  title="Last page"
                  onClick={() => setPage(pagination?.totalPages ?? 1)}
                  disabled={!canGoNext || notificationsQuery.isFetching}
                >
                  <ChevronsRight className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
            <DialogDescription>
              Full notification title and message.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Title</p>
              <p className="text-sm font-medium break-words">{selectedNotification?.title || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Message</p>
              <p className="text-sm text-foreground break-words whitespace-pre-wrap">
                {selectedNotification?.message || "-"}
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              Created: {formatDateTime(selectedNotification?.createdAt || "")}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
