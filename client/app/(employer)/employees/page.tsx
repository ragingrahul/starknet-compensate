"use client";

import React from "react";
import EmployeeDashboard from "./components/EmployeeDashboard";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background to-purple-bg-light">
      <EmployeeDashboard />
    </div>
  );
}
