"use client";

import React, { useState } from "react";
import { Plus, Download, Filter } from "lucide-react";
import EmployeeStats from "./EmployeeStats";
import EmployeeTable from "./EmployeeTable";
import AddEmployeeForm from "./AddEmployeeForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function EmployeeDashboard() {
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);

  return (
    <div className="flex flex-col space-y-8 px-4 py-6 md:px-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-purple-bg-dark">
          Employee Management
        </h1>
        <p className="text-purple-bg-dark3">
          Manage your company&apos;s employees, view statistics, and track
          performance.
        </p>
      </div>

      {showAddEmployeeForm ? (
        <Card className="rounded-xl shadow-md bg-white/80 backdrop-blur-sm border border-purple-border-secondary transition-all duration-300 hover:shadow-lg">
          <div className="flex flex-row items-center justify-between p-6 border-b border-purple-border-secondary">
            <h3 className="text-lg font-medium text-purple-bg-dark">
              Add New Employee
            </h3>
            <Button
              onClick={() => setShowAddEmployeeForm(false)}
              variant="outline"
              className="border-purple-border-secondary hover:bg-purple-bg-light/50 hover:text-purple-primary"
            >
              Cancel
            </Button>
          </div>
          <AddEmployeeForm onComplete={() => setShowAddEmployeeForm(false)} />
        </Card>
      ) : (
        <>
          <EmployeeStats />

          <div className="rounded-xl shadow-md bg-white/80 backdrop-blur-sm border border-purple-border-secondary transition-all duration-300 hover:shadow-lg">
            <div className="flex flex-col space-y-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 border-b border-purple-border-secondary">
              <h3 className="text-lg font-medium text-purple-bg-dark">
                Employees
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1 border-purple-border-secondary hover:bg-purple-bg-light/50 hover:text-purple-primary"
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filter</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1 border-purple-border-secondary hover:bg-purple-bg-light/50 hover:text-purple-primary"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
                <Button
                  onClick={() => setShowAddEmployeeForm(true)}
                  size="sm"
                  className="h-9 gap-1 bg-purple-primary hover:bg-purple-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Employee</span>
                </Button>
              </div>
            </div>
            <EmployeeTable />
          </div>
        </>
      )}
    </div>
  );
}
