/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
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
  FolderIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function MockDashboard() {
  const [mockStats, setMockStats] = useState({
    totalUsers: 1250,
    activeUsers: 892,
    totalRevenue: 45000,
    monthlyGrowth: 12.5,
    totalProjects: 156,
    activeProjects: 89,
    totalHours: 2840,
    pendingApprovals: 4,
    approvedUsers: 1246,
    rejectedUsers: 8,
  });

  const [mockPendingUsers] = useState([
    {
      _id: "1",
      companyName: "TechStart Solutions",
      email: "ceo@techstart.com",
      phone: "9876543210",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      _id: "2",
      companyName: "Digital Innovations Ltd",
      email: "admin@digitalinnovations.com",
      phone: "9876543211",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
    {
      _id: "3",
      companyName: "Global Enterprises",
      email: "manager@globalenterprises.com",
      phone: "9876543212",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
    {
      _id: "4",
      companyName: "Startup Hub",
      email: "founder@startuphub.com",
      phone: "9876543213",
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    },
  ]);

  const [mockRecentActivity] = useState([
    {
      id: 1,
      action: "New user registered",
      user: "TechStart Solutions",
      time: "2 hours ago",
      type: "user",
      icon: UsersIcon,
      color: "text-blue-500",
    },
    {
      id: 2,
      action: "Invoice generated",
      user: "Established Corp",
      time: "3 hours ago",
      type: "invoice",
      icon: DocumentTextIcon,
      color: "text-green-500",
    },
    {
      id: 3,
      action: "Payment received",
      user: "Professional Services",
      time: "5 hours ago",
      type: "payment",
      icon: BanknotesIcon,
      color: "text-purple-500",
    },
    {
      id: 4,
      action: "User approved",
      user: "Enterprise Solutions",
      time: "6 hours ago",
      type: "approval",
      icon: CheckCircleIcon,
      color: "text-emerald-500",
    },
    {
      id: 5,
      action: "User rejected",
      user: "Suspicious Company",
      time: "8 hours ago",
      type: "rejection",
      icon: XCircleIcon,
      color: "text-red-500",
    },
  ]);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    change,
    changeType,
    color,
    subtitle,
  }: {
    title: string;
    value: string | number;
    icon: any;
    change?: string;
    changeType?: "increase" | "decrease";
    color: string;
    subtitle?: string;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {typeof value === "number" && value >= 1000
              ? `${(value / 1000).toFixed(1)}k`
              : typeof value === "number" && value >= 1000000
              ? `$${(value / 1000000).toFixed(1)}M`
              : typeof value === "number" &&
                title.toLowerCase().includes("revenue")
              ? `$${value.toLocaleString()}`
              : value}
          </p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
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

  const PendingApprovals = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Pending User Approvals
        </h3>
        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {mockPendingUsers.length} pending
        </span>
      </div>

      <div className="space-y-4">
        {mockPendingUsers.map((user: any) => (
          <div key={user._id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium text-gray-900">
                  {user.companyName}
                </h4>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-sm text-gray-500">{user.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">
                  {user.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">
                <CheckCircleIcon className="h-4 w-4" />
                Approve
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700">
                <XCircleIcon className="h-4 w-4" />
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ApprovalStats = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        User Approval Statistics
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {mockStats.pendingApprovals}
          </div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {mockStats.approvedUsers}
          </div>
          <div className="text-sm text-gray-500">Approved</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {mockStats.rejectedUsers}
          </div>
          <div className="text-sm text-gray-500">Rejected</div>
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
        {mockRecentActivity.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className={`w-2 h-2 ${activity.color} rounded-full`}></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {activity.action}
              </p>
              <p className="text-sm text-gray-500">
                {activity.user} • {activity.time}
              </p>
            </div>
            <activity.icon className={`h-4 w-4 ${activity.color}`} />
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
            description: "Manage user accounts",
          },
          {
            name: "Generate Report",
            icon: DocumentTextIcon,
            href: "/admin/reports",
            color: "bg-green-500",
            description: "Create system reports",
          },
          {
            name: "Manage Billing",
            icon: BanknotesIcon,
            href: "/admin/billing",
            color: "bg-purple-500",
            description: "Handle subscriptions",
          },
          {
            name: "System Settings",
            icon: ChartBarIcon,
            href: "/admin/settings",
            color: "bg-orange-500",
            description: "Configure system",
          },
        ].map((action) => (
          <a
            key={action.name}
            href={action.href}
            className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
          >
            <div
              className={`p-2 rounded-lg ${action.color} mr-3 group-hover:scale-110 transition-transform`}
            >
              <action.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900 block">
                {action.name}
              </span>
              <span className="text-xs text-gray-500">
                {action.description}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );

  const SystemHealth = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        System Health
      </h3>
      <div className="space-y-4">
        {[
          { name: "Server Status", status: "Online", color: "text-green-600" },
          { name: "Database", status: "Connected", color: "text-green-600" },
          { name: "API Response", status: "Normal", color: "text-green-600" },
          { name: "Storage", status: "85% Used", color: "text-yellow-600" },
        ].map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{item.name}</span>
            <span className={`text-sm font-medium ${item.color}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mock Dashboard</h1>
        <p className="text-gray-600 mt-1">
          This is a mock dashboard showing sample data for testing purposes
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={mockStats.totalUsers}
          icon={UsersIcon}
          change="12.5"
          changeType="increase"
          color="bg-blue-500"
          subtitle="Registered accounts"
        />
        <StatCard
          title="Active Users"
          value={mockStats.activeUsers}
          icon={UserGroupIcon}
          change="8.2"
          changeType="increase"
          color="bg-green-500"
          subtitle="Currently active"
        />
        <StatCard
          title="Total Revenue"
          value={mockStats.totalRevenue}
          icon={CurrencyDollarIcon}
          change="15.3"
          changeType="increase"
          color="bg-purple-500"
          subtitle="From paid invoices"
        />
        <StatCard
          title="Monthly Growth"
          value={`${mockStats.monthlyGrowth}%`}
          icon={ChartBarIcon}
          change="-2.1"
          changeType="decrease"
          color="bg-orange-500"
          subtitle="User growth rate"
        />
      </div>

      {/* User Approval Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PendingApprovals />
        <ApprovalStats />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Projects"
          value={mockStats.totalProjects}
          icon={FolderIcon}
          color="bg-indigo-500"
          subtitle="Created projects"
        />
        <StatCard
          title="Active Projects"
          value={mockStats.activeProjects}
          icon={CalendarIcon}
          color="bg-teal-500"
          subtitle="Currently running"
        />
        <StatCard
          title="Total Hours"
          value={mockStats.totalHours}
          icon={ClockIcon}
          color="bg-pink-500"
          subtitle="Logged time"
        />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivity />
        <QuickActions />
        <SystemHealth />
      </div>
    </div>
  );
}
