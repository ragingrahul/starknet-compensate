import { TrendingDown, TrendingUp, UserCircle } from "lucide-react";
import React from "react";
import { useEmployees } from "@/hooks/useEmployees";

function EmployeeCount() {
  const change = 0;
  const isPositive = change > 0;

  const { employees } = useEmployees();
  const count = employees.length;

  return (
    <div className="flex flex-col sm:flex-row justify-between p-6 h-full gap-4 sm:gap-0">
      <div className="flex flex-col space-y-4 justify-between">
        <h1 className="text-base font-semibold text-purple-bg-dark2 flex items-center">
          <span className="mr-2">Employee Count</span>
        </h1>
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-baseline">
            {count}
            <span className="text-base ml-2 font-medium text-purple-bg-dark">
              team members
            </span>
          </h2>
          <p
            className={`${
              isPositive ? "text-emerald-500" : "text-rose-500"
            } text-sm font-medium flex items-center`}
          >
            {isPositive ? (
              <TrendingUp className="mr-1 h-4 w-4" />
            ) : (
              <TrendingDown className="mr-1 h-4 w-4" />
            )}
            {Math.abs(change)}% {isPositive ? "more" : "less"} than last month
          </p>
        </div>
      </div>
      <div className="bg-gradient-to-br from-purple-bg-light2 to-purple-primary/20 p-4 h-fit rounded-xl shadow-sm self-start sm:self-auto flex items-center justify-center">
        <UserCircle className="h-10 w-10 text-purple-primary" />
      </div>
    </div>
  );
}

export default EmployeeCount;
