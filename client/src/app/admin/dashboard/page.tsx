"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  UserGroupIcon,
  BanknotesIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = (await api("/api/admin/dashboard/stats")) as {
        success: boolean;
        stats: Record<string, number>;
      };
      if (response.success) {
        // Ensure only the expected keys are set, to match the state type
        setStats({
          totalUsers: response.stats.totalUsers ?? 0,
          activeUsers: response.stats.activeUsers ?? 0,
          totalRevenue: response.stats.totalRevenue ?? 0,
          monthlyGrowth: response.stats.monthlyGrowth ?? 0,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    change,
    changeType,
    color,
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    change?: string;
    changeType?: "increase" | "decrease";
    color: string;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {typeof value === "number" && value >= 1000
              ? `${(value / 1000).toFixed(1)}k`
              : value}
          </p>
          {change && (
            <div className="flex items-center mt-2">
              {changeType === "increase" ? (
                <ArrowUpIcon className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ml-1 ${
                  changeType === "increase" ? "text-green-600" : "text-red-600"
                }`}
              >
                {change}%
              </span>
              <span className="text-sm text-gray-500 ml-1">
                from last month
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const RecentActivity = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Activity
      </h3>
      <div className="space-y-4">
        {[
          {
            action: "New user registered",
            time: "2 minutes ago",
            type: "user",
          },
          {
            action: "Invoice generated",
            time: "15 minutes ago",
            type: "invoice",
          },
          { action: "Payment received", time: "1 hour ago", type: "payment" },
          { action: "Report generated", time: "2 hours ago", type: "report" },
        ].map((activity, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {activity.action}
              </p>
              <p className="text-sm text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const QuickActions = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            name: "View Users",
            icon: UsersIcon,
            href: "/admin/users",
            color: "bg-blue-500",
          },
          {
            name: "Generate Report",
            icon: DocumentTextIcon,
            href: "/admin/reports",
            color: "bg-green-500",
          },
          {
            name: "Manage Billing",
            icon: BanknotesIcon,
            href: "/admin/billing",
            color: "bg-purple-500",
          },
          {
            name: "System Settings",
            icon: ChartBarIcon,
            href: "/admin/settings",
            color: "bg-orange-500",
          },
        ].map((action) => (
          <a
            key={action.name}
            href={action.href}
            className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className={`p-2 rounded-lg ${action.color} mr-3`}>
              <action.icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900">
              {action.name}
            </span>
          </a>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={UsersIcon}
          change="12.5"
          changeType="increase"
          color="bg-blue-500"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={UserGroupIcon}
          change="8.2"
          changeType="increase"
          color="bg-green-500"
        />
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          icon={CurrencyDollarIcon}
          change="15.3"
          changeType="increase"
          color="bg-purple-500"
        />
        <StatCard
          title="Monthly Growth"
          value={`${stats.monthlyGrowth}%`}
          icon={ChartBarIcon}
          change="-2.1"
          changeType="decrease"
          color="bg-orange-500"
        />
      </div>

      {/* Charts and Additional Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Overview
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart placeholder</p>
              <p className="text-sm text-gray-400">
                Revenue analytics will be displayed here
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            User Activity
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart placeholder</p>
              <p className="text-sm text-gray-400">
                User activity analytics will be displayed here
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <QuickActions />
      </div>
    </div>
  );
}
