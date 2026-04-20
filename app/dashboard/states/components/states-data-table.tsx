"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardOverview } from "@/lib/api/states.api";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { API } from "@/lib/api/axios";

interface StateOverview {
  state: string;
  totalRides: number;
  activeRides: number;
  passengers: number;
  drivers: number;
}

export default function StatesOverviewTable() {
  const router = useRouter();

 const { data, isLoading, error } = useQuery({
  queryKey: ["dashboard-overview"],
  queryFn: getDashboardOverview,
});

  const handleClick = (type: string, state: string) => {
    switch (type) {
      case "drivers":
        router.push(`/dashboard/drivers?state=${state}`);
        break;
      case "passengers":
        router.push(`/dashboard/users?state=${state}`);
        break;
      case "rides":
        router.push(`/dashboard/rides?state=${state}`);
        break;
      case "activeRides":
        router.push(`/dashboard/ongoing-rides?state=${state}&status=active`);
        break;
    }
  };

  return (
    <Card className="border rounded-md bg-white">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>State</TableHead>
              <TableHead>Total Rides</TableHead>
              <TableHead>Active Rides</TableHead>
              <TableHead>Passengers</TableHead>
              <TableHead>Drivers</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-red-500">
                  Failed to load data
                </TableCell>
              </TableRow>
            ) : data?.length ? (
              data.map((row) => (
                <TableRow key={row.state} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {row.state}
                  </TableCell>

                  <TableCell
                    onClick={() => handleClick("rides", row.state)}
                    className="cursor-pointer text-[#0cba70] hover:underline"
                  >
                    {row.totalRides.toLocaleString()}
                  </TableCell>

                  <TableCell
                    onClick={() => handleClick("activeRides", row.state)}
                    className="cursor-pointer text-[#0cba70] hover:underline"
                  >
                    {row.activeRides.toLocaleString()}
                  </TableCell>

                  <TableCell
                    onClick={() => handleClick("passengers", row.state)}
                    className="cursor-pointer text-[#0cba70] hover:underline"
                  >
                    {row.passengers.toLocaleString()}
                  </TableCell>

                  <TableCell
                    onClick={() => handleClick("drivers", row.state)}
                    className="cursor-pointer text-[#0cba70] hover:underline"
                  >
                    {row.drivers.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}