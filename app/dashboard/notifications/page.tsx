"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Bell,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { TableEmptyState, TableErrorState } from "@/components/ui/table-empty-state";
import { TablePagination } from "@/components/ui/table-pagination";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
  const [isConfirmSendOpen, setIsConfirmSendOpen] = useState(false);
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
      setIsConfirmSendOpen(false);
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

  const handleOpenConfirm = () => {
    const sanitizedTitle = title.trim();
    const sanitizedMessage = message.trim();

    if (!sanitizedTitle || !sanitizedMessage) {
      setFormError("Both title and message are required.");
      return;
    }

    setFormError(null);
    setIsConfirmSendOpen(true);
  };

  const handleConfirmSend = async () => {
    const sanitizedTitle = title.trim();
    const sanitizedMessage = message.trim();
    await createNotificationMutation.mutateAsync({
      title: sanitizedTitle,
      message: sanitizedMessage,
    });
  };

  const handleViewNotification = (notification: NotificationItem) => {
    setSelectedNotification(notification);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, schedule, and review broadcast announcements to users and drivers.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="inline-flex items-center gap-2 rounded-lg font-medium shadow-2xs">
              <Plus className="size-4" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl border bg-card">
            <DialogHeader className="border-b bg-muted/30 px-6 py-5">
              <DialogTitle className="text-foreground text-lg">Create Broadcast Notification</DialogTitle>
              <DialogDescription className="text-xs">
                Broadcast an important update or alert to all registered users.
              </DialogDescription>
            </DialogHeader>

            <div className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="notification-title" className="text-xs font-medium text-foreground">
                  Notification Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="notification-title"
                  value={title}
                  maxLength={120}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Scheduled System Maintenance"
                  className="text-xs focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notification-message" className="text-xs font-medium text-foreground">
                  Message Body <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="notification-message"
                  value={message}
                  maxLength={500}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Write message details for platform users..."
                  rows={5}
                  className="text-xs focus:ring-primary/20"
                />
                <div className="flex justify-end text-[11px] text-muted-foreground">
                  {message.length} / 500 characters
                </div>
              </div>

              {formError ? <p className="text-xs font-medium text-destructive">{formError}</p> : null}
            </div>

            <DialogFooter className="border-t bg-muted/10 px-6 py-4 gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white hover:text-white transition-colors"
                onClick={handleOpenConfirm}
                disabled={createNotificationMutation.isPending}
              >
                Continue to Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Metric Card */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="rounded-xl border border-border/80 shadow-2xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Broadcasts</CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              {totalMessages.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground inline-flex items-center gap-1.5">
            <Bell className="size-3.5 text-primary" />
            Total notifications stored and broadcast
          </CardContent>
        </Card>
      </div>

      {/* Unified Table Card */}
      <div className="rounded-xl border border-border/80 bg-card text-card-foreground shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Title</TableHead>
                <TableHead className="min-w-[380px]">Message</TableHead>
                <TableHead className="min-w-[160px] text-right">Created At</TableHead>
                <TableHead className="w-[100px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notificationsQuery.isLoading ? (
                <TableSkeleton columns={4} rows={limit} showAvatar={false} />
              ) : notificationsQuery.error ? (
                <TableErrorState
                  colSpan={4}
                  error={
                    notificationsQuery.error instanceof Error
                      ? notificationsQuery.error.message
                      : "Failed to load notifications"
                  }
                  onRetry={() => notificationsQuery.refetch()}
                />
              ) : notifications.length > 0 ? (
                notifications.map((item) => (
                  <TableRow key={item.id} className="transition-colors">
                    <TableCell className="font-semibold text-foreground">
                      <span className="block max-w-[260px] truncate" title={item.title || "-"}>
                        {truncateText(item.title || "-", 45)}
                      </span>
                    </TableCell>

                    <TableCell className="text-muted-foreground text-sm">
                      <span className="block max-w-[500px] truncate" title={item.message || "-"}>
                        {truncateText(item.message || "-", 95)}
                      </span>
                    </TableCell>

                    <TableCell className="text-right text-muted-foreground text-xs font-medium">
                      {formatDateTime(item.createdAt)}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => handleViewNotification(item)}
                      >
                        <Eye className="mr-1 size-3.5" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmptyState
                  colSpan={4}
                  icon={Bell}
                  title="No notifications sent"
                  description="You have not created or broadcast any notifications yet. Click 'Create Notification' to send one."
                />
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Unified Pagination */}
      <TablePagination
        page={pagination?.page ?? page}
        totalPages={pagination?.totalPages ?? 1}
        limit={limit}
        total={pagination?.total ?? notifications.length}
        entityLabel="notifications"
        isFetching={notificationsQuery.isFetching}
        onPageChange={(nextPage) => setPage(nextPage)}
        onPageSizeChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
      />

      {/* View Notification Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg p-6 rounded-2xl border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground">Notification Details</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Review complete notification content and broadcast timestamp.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Title</p>
              <p className="text-base font-semibold text-foreground break-words">{selectedNotification?.title || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Message</p>
              <div className="rounded-xl border bg-muted/30 p-3.5 text-sm text-foreground break-words whitespace-pre-wrap leading-relaxed">
                {selectedNotification?.message || "-"}
              </div>
            </div>
            <div className="text-xs text-muted-foreground pt-1">
              Broadcasted on: <span className="font-medium text-foreground">{formatDateTime(selectedNotification?.createdAt || "")}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Notification Confirmation Popup */}
      <ConfirmDialog
        open={isConfirmSendOpen}
        onOpenChange={setIsConfirmSendOpen}
        title="Send Broadcast Notification"
        description={
          <div>
            <p className="mb-2">
              Are you sure you want to broadcast <span className="font-semibold text-foreground">"{title}"</span> to all platform users?
            </p>
            <p className="text-xs text-muted-foreground">
              This message will be dispatched immediately to all registered accounts and cannot be revoked.
            </p>
          </div>
        }
        confirmText="Confirm & Send"
        variant="primary"
        icon={Send}
        isLoading={createNotificationMutation.isPending}
        onConfirm={handleConfirmSend}
      />
    </div>
  );
}
