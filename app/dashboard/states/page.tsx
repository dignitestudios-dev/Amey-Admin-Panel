"use client";

import StateCardsView from "./components/state-cards";

export default function StatesPage() {
  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">States Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor platform activity, real-time ongoing rides, and registered users across all US states
        </p>
      </div>

      <StateCardsView />
    </div>
  );
}