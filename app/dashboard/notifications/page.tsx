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
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const truncateText = (value: string, maxLength: number) => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
};

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState<NotificationItem | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const notificationsQuery = useQuery({
    queryKey: ["notifications", page, limit],
    queryFn: () => getNotifications({ page, limit }),
  });

  const createNotificationMutation = useMutation({
    mutationFn: createNotification,
    onSuccess: (data) => {
      toast.success(data.message || "Notification dispatched successfully.");
      setIsCreateOpen(false);
      setTitle("");
      setMessage("");
      setFormError(null);
      notificationsQuery.refetch();
    },
    onError: (error) => {
      setFormError(
        error instanceof Error ? error.message : "Failed to broadcast notification."
      );
    },
  });

  const notifications = notificationsQuery.data?.notifications ?? [];
  const pagination = notificationsQuery.data?.pagination;
  const totalMessages = pagination?.total ?? notifications.length;

  const canGoPrev = page > 1;
  const canGoNext = page < (pagination?.totalPages ?? 1);

  const handleCreateNotification = () => {
    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();

    if (!trimmedTitle || !trimmedMessage) {
      setFormError("Title and message are required.");
      return;
    }

    setFormError(null);
    createNotificationMutation.mutate({
      title: trimmedTitle,
      message: trimmedMessage,
    });
  };

  const handleViewNotification = (item: NotificationItem) => {
    setActiveNotification(item);
    setIsViewOpen(true);
  };

  return (
    <div className="flex flex-col min-w-0">
      {/* Signature EpicRides Page Header */}
      <header className="border-b border-border/60 bg-card/60 px-5 sm:px-6 pt-5 pb-5 backdrop-blur-md">
        <nav className="mb-2 flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <span>Communications</span>
          <ChevronRight className="size-3 opacity-50" />
          <span className="text-foreground font-medium">Broadcasts</span>
        </nav>
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <p className="eyebrow mb-1">System broadcasts</p>
            <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
              Notifications & Alerts
            </h1>
            <p className="text-[15px] leading-relaxed text-muted-foreground mt-0.5">
              Broadcast platform alerts, service advisories, and system communications to riders and fleet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-baseline gap-1.5 rounded-md border border-border/70 bg-background/60 px-2.5 py-1">
              <span className="text-[12px] uppercase tracking-[0.05em] text-muted-foreground">Dispatched</span>
              <span className="text-xs font-semibold tnum text-primary">
                {totalMessages}
              </span>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="h-7 px-3 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 rounded-md cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>New Broadcast</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md p-0 overflow-hidden border-border/70 bg-card rounded-lg">
                <DialogHeader className="border-b border-border/60 bg-muted/20 px-5 py-4">
                  <DialogTitle className="text-[16px] font-semibold tracking-tight text-foreground">
                    Compose Broadcast
                  </DialogTitle>
                  <DialogDescription className="text-[14px] text-muted-foreground">
                    This notification will be delivered to active devices.
                  </DialogDescription>
                </DialogHeader>

                <div className="p-5 space-y-3.5">
                  <div className="space-y-1">
                    <Label htmlFor="notification-title" className="text-[13px] font-medium text-foreground/80">
                      Headline
                    </Label>
                    <Input
                      id="notification-title"
                      value={title}
                      maxLength={120}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Inclement Weather Advisory"
                      className="h-8 text-[14px] bg-background border-border/70"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="notification-message" className="text-[13px] font-medium text-foreground/80">
                      Message Content
                    </Label>
                    <Textarea
                      id="notification-message"
                      value={message}
                      maxLength={500}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter announcement details..."
                      rows={4}
                      className="text-[14px] bg-background border-border/70"
                    />
                  </div>

                  {formError ? <p className="text-[13px] text-destructive">{formError}</p> : null}
                </div>

                <DialogFooter className="border-t border-border/60 bg-muted/10 px-5 py-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreateOpen(false)}
                    className="h-8 text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreateNotification}
                    disabled={createNotificationMutation.isPending}
                    className="h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                  >
                    {createNotificationMutation.isPending ? (
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    ) : (
                      <Send className="mr-1.5 size-3.5" />
                    )}
                    Send Broadcast
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 lg:p-7 max-w-[1600px] w-full mx-auto space-y-4">
        {/* View Notification Modal */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden border-border/70 bg-card rounded-lg">
            <DialogHeader className="border-b border-border/60 bg-muted/20 px-5 py-4">
              <DialogTitle className="text-[16px] font-semibold tracking-tight text-foreground">
                {activeNotification?.title || "Notification"}
              </DialogTitle>
              <DialogDescription className="text-[13px] text-muted-foreground font-mono">
                {formatDateTime(activeNotification?.createdAt || "")}
              </DialogDescription>
            </DialogHeader>
            <div className="p-5 text-[15px] leading-relaxed text-foreground">
              {activeNotification?.message}
            </div>
            <DialogFooter className="border-t border-border/60 bg-muted/10 px-5 py-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsViewOpen(false)}
                className="h-8 text-xs"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Table Container */}
        <div className="rounded-lg border border-border/70 bg-card/85 backdrop-blur-md overflow-hidden shadow-xs">
          <Table className="w-full text-[15px]">
            <TableHeader className="bg-muted/40 border-b border-border/70">
              <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="h-9 px-4 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                      Headline
                    </TableHead>
                    <TableHead className="h-9 px-4 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                      Message
                    </TableHead>
                    <TableHead className="h-9 px-4 text-left text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                      Sent Date
                    </TableHead>
                    <TableHead className="h-9 px-4 text-right text-[12px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notificationsQuery.isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-12 text-muted-foreground text-xs"
                      >
                        Loading broadcast history...
                      </TableCell>
                    </TableRow>
                  ) : notificationsQuery.error ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-12 text-destructive text-xs"
                      >
                        Failed to load notifications
                      </TableCell>
                    </TableRow>
                  ) : notifications.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-12 text-muted-foreground text-xs"
                      >
                        No broadcasts dispatched yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    notifications.map((item: NotificationItem) => (
                      <TableRow
                        key={item.id}
                        className="hover:bg-muted/40 border-b border-border/50 transition-colors"
                      >
                        <TableCell className="px-4 py-2.5 font-medium text-foreground">
                          <span className="block max-w-[260px] truncate" title={item.title || "-"}>
                            {truncateText(item.title || "-", 40)}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-2.5 text-muted-foreground">
                          <span className="block max-w-[500px] truncate" title={item.message || "-"}>
                            {truncateText(item.message || "-", 80)}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-2.5 font-mono text-[13px] text-muted-foreground tnum">
                          {formatDateTime(item.createdAt)}
                        </TableCell>
                        <TableCell className="px-4 py-2.5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[13px] text-primary hover:bg-primary/10 rounded-md cursor-pointer"
                            onClick={() => handleViewNotification(item)}
                          >
                            <Eye className="mr-1 size-3.5" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between px-1 py-1 text-[14px] text-muted-foreground">
          <div>
            Showing <span className="font-semibold text-foreground tnum">{notifications.length}</span> of{" "}
            <span className="font-semibold text-foreground tnum">{totalMessages}</span> broadcasts
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>Rows:</span>
              <Select
                value={String(limit)}
                onValueChange={(value) => {
                  setLimit(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-7 w-16 text-[13px] bg-card border-border/70">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-[14px] tnum">
              Page <span className="font-semibold text-foreground">{pagination?.page ?? page}</span> of{" "}
              <span className="font-semibold text-foreground">{pagination?.totalPages ?? 1}</span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={!canGoPrev || notificationsQuery.isFetching}
                className="h-7 px-2 text-[13px] rounded-md border-border/70 cursor-pointer"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((prev) =>
                    Math.min(pagination?.totalPages ?? prev + 1, prev + 1)
                  )
                }
                disabled={!canGoNext || notificationsQuery.isFetching}
                className="h-7 px-2 text-[13px] rounded-md border-border/70 cursor-pointer"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
