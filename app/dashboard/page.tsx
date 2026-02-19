import { ChartAreaStacked } from "@/components/charts-and-graphs/ChartAreaStacked";
import { ChartBarMultiple } from "@/components/charts-and-graphs/ChartBarMultiple";
import React from "react";

const Dashboard = () => {
  return (
    <div className="grid grid-cols-3 gap-5">
      <ChartAreaStacked />
      <ChartBarMultiple />
    </div>
  );
};

export default Dashboard;
