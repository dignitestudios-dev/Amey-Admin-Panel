"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Eye,
  Check,
  X,
  Ban,
  Play,
  Search,
  Filter,
  RotateCcw,
  Star,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

const driversData = [
  {
    id: "DRV001",
    name: "James Mitchell",
    status: "approved",
    rating: 4.8,
    totalRides: 256,
    earnings: 12500,
    armed: false,
    joinDate: "2023-05-10",
  },
  {
    id: "DRV002",
    name: "Sarah Johnson",
    status: "pending",
    rating: 0,
    totalRides: 0,
    earnings: 0,
    armed: true,
    joinDate: "2024-02-01",
  },
  {
    id: "DRV003",
    name: "Michael Chen",
    status: "approved",
    rating: 4.5,
    totalRides: 189,
    earnings: 9200,
    armed: true,
    joinDate: "2023-08-15",
  },
  {
    id: "DRV004",
    name: "Jessica Thompson",
    status: "rejected",
    rating: 2.1,
    totalRides: 45,
    earnings: 1800,
    armed: false,
    joinDate: "2024-01-20",
  },
  {
    id: "DRV005",
    name: "David Rodriguez",
    status: "approved",
    rating: 4.9,
    totalRides: 342,
    earnings: 18500,
    armed: false,
    joinDate: "2023-03-12",
  },
  {
    id: "DRV006",
    name: "Emily Patterson",
    status: "suspended",
    rating: 3.2,
    totalRides: 120,
    earnings: 5200,
    armed: true,
    joinDate: "2023-11-05",
  },
  {
    id: "DRV007",
    name: "Robert Williams",
    status: "approved",
    rating: 4.7,
    totalRides: 198,
    earnings: 10800,
    armed: false,
    joinDate: "2023-06-20",
  },
  {
    id: "DRV008",
    name: "Amanda Martinez",
    status: "pending",
    rating: 0,
    totalRides: 0,
    earnings: 0,
    armed: false,
    joinDate: "2024-02-10",
  },
  {
    id: "DRV009",
    name: "Christopher Brown",
    status: "approved",
    rating: 4.6,
    totalRides: 215,
    earnings: 11500,
    armed: true,
    joinDate: "2023-07-08",
  },
  {
    id: "DRV010",
    name: "Lauren Davis",
    status: "rejected",
    rating: 1.8,
    totalRides: 28,
    earnings: 900,
    armed: false,
    joinDate: "2024-01-15",
  },
];

type Driver = (typeof driversData)[0];
type Status = "pending" | "approved" | "rejected" | "suspended";

interface Filters {
  status: string;
  rating: string;
  rideCount: string;
  armedType: string;
}

const getStatusColor = (status: Status) => {
  // Small colored text with low-opacity background of same color
  switch (status) {
    case "approved":
      return "text-green-700 bg-green-700/10 border-green-700/10";
    case "pending":
      return "text-amber-700 bg-amber-700/10 border-amber-700/10";
    case "rejected":
      return "text-red-700 bg-red-700/10 border-red-700/10";
    case "suspended":
      return "text-orange-700 bg-orange-700/10 border-orange-700/10";
    default:
      return "text-gray-700 bg-gray-700/10 border-gray-700/10";
  }
};

const handleAction = (action: string, driverId: string, driverName: string) => {
  console.log(`[ACTION] ${action} for driver: ${driverId} (${driverName})`);
};

export function DriversDataTable() {
  const [filters, setFilters] = useState<Filters>({
    status: "all",
    rating: "all",
    rideCount: "all",
    armedType: "all",
  });
  const [draftFilters, setDraftFilters] = useState<Filters>(filters);
  const [searchQuery, setSearchQuery] = useState("");

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeFilterCount = [
    filters.status,
    filters.rating,
    filters.rideCount,
    filters.armedType,
  ].filter((value) => value !== "all").length;

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.rating !== "all" ||
    filters.rideCount !== "all" ||
    filters.armedType !== "all" ||
    searchQuery !== "";

  const filteredDrivers = useMemo(() => {
    return driversData.filter((driver: Driver) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      if (
        searchLower &&
        !driver.name.toLowerCase().includes(searchLower) &&
        !driver.id.toLowerCase().includes(searchLower)
      ) {
        return false;
      }

      // Status filter
      if (filters.status !== "all" && driver.status !== filters.status) {
        return false;
      }
      // Rating filter
      if (filters.rating !== "all") {
        const rating = parseFloat(filters.rating);
        if (driver.rating < rating) {
          return false;
        }
      }
      // Rides count filter
      if (filters.rideCount !== "all") {
        const rides = parseInt(filters.rideCount);
        if (driver.totalRides < rides) {
          return false;
        }
      }
      // Armed type filter
      if (filters.armedType !== "all") {
        const isArmed = filters.armedType === "armed";
        if (driver.armed !== isArmed) {
          return false;
        }
      }
      return true;
    });
  }, [filters, searchQuery]);

  const renderActionButtons = (driver: Driver) => {
    const status = driver.status as Status;
    switch (status) {
      case "pending":
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-gray-600 hover:text-black"
              onClick={() => handleAction("APPROVE", driver.id, driver.name)}
              title="Approve"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-gray-600 hover:text-black"
              onClick={() => handleAction("REJECT", driver.id, driver.name)}
              title="Reject"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        );
      case "rejected":
        return (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-gray-600 hover:text-black"
            onClick={() => handleAction("APPROVE", driver.id, driver.name)}
            title="Approve"
          >
            <Check className="w-4 h-4" />
          </Button>
        );
      case "approved":
        return (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-gray-600 hover:text-black"
            onClick={() => handleAction("SUSPEND", driver.id, driver.name)}
            title="Suspend"
          >
            <Ban className="w-4 h-4" />
          </Button>
        );
      case "suspended":
        return (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-gray-600 hover:text-black"
            onClick={() => handleAction("ACTIVATE", driver.id, driver.name)}
            title="Activate"
          >
            <Play className="w-4 h-4" />
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header: title + search + filter */}
      <div className="flex items-center justify-between">
        <span />

        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search drivers..."
              className="pl-10 h-9 text-sm border border-gray-200 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 border border-gray-200 relative"
            onClick={() => {
              setDraftFilters(filters);
              setIsFilterOpen(true);
            }}
            title="Open filters"
          >
            <Filter className="w-4 h-4 text-gray-700" />
            {activeFilterCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 h-4 min-w-4 rounded-full bg-black px-1 text-[10px] leading-4 text-white">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-black"
              onClick={() => {
                setFilters({
                  status: "all",
                  rating: "all",
                  rideCount: "all",
                  armedType: "all",
                });
                setSearchQuery("");
                console.log("[ACTION] Clear filters");
              }}
              title="Clear filters"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filter Dialog (minimal) */}
      <Dialog
        open={isFilterOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDraftFilters(filters);
          }
          setIsFilterOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-140 p-0 overflow-hidden">
          <DialogHeader className="border-b bg-muted/30 px-6 py-5">
            <DialogTitle className="text-black">Filter Drivers</DialogTitle>
            <DialogDescription>
              Select your criteria and save to apply all filters at once.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-5 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-black block">Status</label>
              <Select
                value={draftFilters.status}
                onValueChange={(value) =>
                  setDraftFilters({ ...draftFilters, status: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-black block">Minimum Rating</label>
              <Select
                value={draftFilters.rating}
                onValueChange={(value) =>
                  setDraftFilters({ ...draftFilters, rating: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="3">3.0 stars & above</SelectItem>
                  <SelectItem value="3.5">3.5 stars & above</SelectItem>
                  <SelectItem value="4">4.0 stars & above</SelectItem>
                  <SelectItem value="4.5">4.5 stars & above</SelectItem>
                </SelectContent>
              </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-black block">Minimum Rides</label>
              <Select
                value={draftFilters.rideCount}
                onValueChange={(value) =>
                  setDraftFilters({ ...draftFilters, rideCount: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Counts</SelectItem>
                  <SelectItem value="50">50+ rides</SelectItem>
                  <SelectItem value="100">100+ rides</SelectItem>
                  <SelectItem value="200">200+ rides</SelectItem>
                  <SelectItem value="300">300+ rides</SelectItem>
                </SelectContent>
              </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-black block">Armed Type</label>
              <Select
                value={draftFilters.armedType}
                onValueChange={(value) =>
                  setDraftFilters({ ...draftFilters, armedType: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="armed">Armed</SelectItem>
                  <SelectItem value="unarmed">Unarmed</SelectItem>
                </SelectContent>
              </Select>
              </div>
            </div>

            <div className="rounded-lg bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              {activeFilterCount > 0
                ? `${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} currently applied.`
                : "No filters are currently applied."}
            </div>
          </div>

          <DialogFooter className="border-t px-6 py-4 gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setDraftFilters({
                  status: "all",
                  rating: "all",
                  rideCount: "all",
                  armedType: "all",
                })
              }
            >
              Reset
            </Button>
            <Button variant="outline" onClick={() => setIsFilterOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setFilters(draftFilters);
                setIsFilterOpen(false);
                console.log("[ACTION] Save filters");
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table Section */}
      <Card className="shadow-none border-none pt-0 rounded-md overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50 rounded-2xl!">
                <TableRow className="h-16 border-none rounded-2xl!">
                  <TableHead className="">Name</TableHead>
                  <TableHead className="">Status</TableHead>
                  <TableHead className="text-center ">Rating</TableHead>
                  <TableHead className="text-center ">Total Rides</TableHead>
                  <TableHead className="text-right ">Earnings</TableHead>
                  <TableHead className="text-center">View</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.length > 0 ? (
                  filteredDrivers.map((driver: Driver) => (
                    <TableRow
                      key={driver.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell>
                        <div>
                          <p className="">{driver.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {driver.id}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs rounded-full px-2 py-0.5 ${getStatusColor(driver.status as Status)}`}
                        >
                          {driver.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-light">
                        {driver.rating > 0 ? (
                          <span className=" text-black">
                            <Star className="w-4 h-4 inline mr-1 mb-1 text-yellow-500" />{" "}
                            {driver.rating}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No rating
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className=" text-black">{driver.totalRides}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className=" text-black">
                          ${driver.earnings.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="h-full flex justify-center items-center">
                        <Link
                          href={`/dashboard/drivers/${driver.id}`}
                          className="text-center"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          {renderActionButtons(driver)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <p className="text-muted-foreground">
                        No drivers found matching filters
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
