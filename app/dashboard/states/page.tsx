"use client";

import StatesOverviewTable  from "./components/states-data-table";

export default function DashboardPage() {
  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">States</h1>
        <p className="text-sm text-gray-500 mt-2">
          Monitor platform activity across all states
        </p>
      </div>

      <StatesOverviewTable />
    </div>
  );
}