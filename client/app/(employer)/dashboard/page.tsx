"use client";

import React from "react";
import PayrollOverview from "./components/PayrollOverview";
import PayrollStats from "./components/PayrollStats";
import OrgTitle from "./components/OrgTitle";
import TreasuryBalance from "./components/TreasuryBalance";
import EmployeeCount from "./components/EmployeeCount";

function Page() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 bg-gradient-to-br from-background to-purple-bg-light">
      <h1 className="text-2xl font-bold text-purple-bg-dark">
        Dashboard Overview
      </h1>

      <div className="grid auto-rows-min gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="rounded-xl shadow-md bg-white/80 backdrop-blur-sm border border-purple-border-secondary transition-all duration-300 hover:shadow-lg hover:bg-white/90 hover:scale-[1.01]">
          <EmployeeCount />
        </div>
        <div className="rounded-xl shadow-md bg-white/80 backdrop-blur-sm border border-purple-border-secondary transition-all duration-300 hover:shadow-lg hover:bg-white/90 hover:scale-[1.01]">
          <TreasuryBalance />
        </div>
        <div className="rounded-xl shadow-md bg-white/80 backdrop-blur-sm border border-purple-border-secondary transition-all duration-300 hover:shadow-lg hover:bg-white/90 hover:scale-[1.01]">
          <OrgTitle />
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 h-full lg:grid-cols-3">
        <div className="rounded-xl shadow-md bg-white/80 backdrop-blur-sm border border-purple-border-secondary lg:col-span-2 h-full transition-all duration-300 hover:shadow-lg hover:bg-white/90">
          <PayrollOverview />
        </div>
        <div className="rounded-xl shadow-md bg-white/80 backdrop-blur-sm border border-purple-border-secondary h-full transition-all duration-300 hover:shadow-lg hover:bg-white/90">
          <PayrollStats />
        </div>
      </div>
    </div>
  );
}

export default Page;
