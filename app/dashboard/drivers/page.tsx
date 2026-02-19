import React from "react";
import { DriversDataTable } from "./components/drivers-data-table";

const Drivers = () => {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black">Driver Management</h1>
        <p className="text-sm text-gray-500 mt-2">
          Manage driver accounts, approve applications, and monitor driver activities
        </p>
      </div>
      <DriversDataTable />
    </div>
  );
};

export default Drivers;
