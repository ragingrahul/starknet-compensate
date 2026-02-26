import { Users, TrendingUp, Clock, Banknote } from "lucide-react";
import React from "react";
import { useEmployees } from "@/hooks/useEmployees";

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
};

const StatCard = ({ title, value, subtitle, trend, icon }: StatCardProps) => {
  return (
    <div className="rounded-xl shadow-md bg-white/80 backdrop-blur-sm border border-purple-border-secondary p-6 flex flex-col space-y-4 transition-all duration-300 hover:shadow-lg hover:bg-white/90 hover:scale-[1.01]">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-purple-bg-dark3">{title}</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-bold text-purple-bg-dark">{value}</p>
            {trend && (
              <span
                className={`ml-2 text-sm font-medium flex items-center ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingUp className="h-3 w-3 mr-1 transform rotate-180" />
                )}
                {trend.value}%
              </span>
            )}
          </div>
        </div>
        <div className="rounded-full p-3 bg-purple-bg-light text-purple-primary">
          {icon}
        </div>
      </div>
      <p className="text-sm text-purple-bg-dark3">{subtitle}</p>
    </div>
  );
};

const EmployeeStats = () => {
  const { employees, loading } = useEmployees();

  // Calculate statistics from real data
  const totalEmployees = employees.length;

  // Calculate average salary
  const averageSalary =
    employees.length > 0
      ? employees.reduce((sum, employee) => sum + employee.salary, 0) /
        employees.length
      : 0;

  // Format average salary as currency
  const formattedAverageSalary = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(averageSalary);

  // Count active employees
  const activeEmployees = employees.filter(
    (employee) => employee.status?.toLowerCase() === "active"
  ).length;

  // Calculate active percentage
  const activePercentage =
    totalEmployees > 0
      ? Math.round((activeEmployees / totalEmployees) * 100)
      : 0;

  const stats = [
    {
      title: "Total Employees",
      value: loading ? "..." : totalEmployees,
      subtitle: "Employees in your company",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Average Salary",
      value: loading ? "..." : formattedAverageSalary,
      subtitle: "Annual average salary",
      icon: <Banknote className="h-5 w-5" />,
    },
    {
      title: "Active Employees",
      value: loading ? "..." : `${activeEmployees} (${activePercentage}%)`,
      subtitle: "Currently active employees",
      icon: <Clock className="h-5 w-5" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default EmployeeStats;
