/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, type ComponentType } from "react";
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
  FolderIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalHours: 0,
  });
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [approvalStats, setApprovalStats] = useState({
    pendingApprovals: 0,
    approvedUsers: 0,
    rejectedUsers: 0,
  });
  const [approvalLoading, setApprovalLoading] = useState(false);

  interface ActivityItem {
    id: number;
    action: string;
    user: string;
    time: string;
    type: string;
    icon: ComponentType<{ className?: string }>;
    color: string;
  }
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
    fetchPendingUsers();
    fetchApprovalStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = (await api("/api/admin/dashboard/stats")) as {
        success: boolean;
        stats: Record<string, number>;
      };

      console.log("response1", response);

      if (response.success) {
        setStats({
          totalUsers: response.stats.totalUsers ?? 0,
          activeUsers: response.stats.activeUsers ?? 0,
          totalRevenue: response.stats.totalRevenue ?? 0,
          monthlyGrowth: response.stats.monthlyGrowth ?? 0,
          totalProjects: response.stats.totalProjects ?? 0,
          activeProjects: response.stats.activeProjects ?? 0,
          totalHours: response.stats.totalHours ?? 0,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const response = (await api(
        "/api/admin/user-approval/pending-users"
      )) as {
        success: boolean;
        pendingUsers: any[];
      };
      if (response.success) {
        setPendingUsers(response.pendingUsers || []);
      }
    } catch (error) {
      console.error("Error fetching pending users:", error);
    }
  };

  const fetchApprovalStats = async () => {
    try {
      const response = (await api(
        "/api/admin/user-approval/approval-stats"
      )) as {
        success: boolean;
        stats: {
          pendingApprovals: number;
          approvedUsers: number;
          rejectedUsers: number;
        };
      };
      if (response.success) {
        setApprovalStats(response.stats);
      }
    } catch (error) {
      console.error("Error fetching approval stats:", error);
    }
  };

  const handleApproveUser = async (pendingUserId: string) => {
    setApprovalLoading(true);
    try {
      const response = (await api(
        `/api/admin/user-approval/approve-user/${pendingUserId}`,
        {
          method: "POST",
          json: {},
        }
      )) as { success: boolean; message?: string };

      if (response.success) {
        // Refresh the data
        await Promise.all([
          fetchPendingUsers(),
          fetchApprovalStats(),
          fetchStats(),
        ]);
        alert("User approved successfully!");
      } else {
        alert("Failed to approve user: " + response.message);
      }
    } catch (error) {
      console.error("Error approving user:", error);
      alert("Error approving user. Please try again.");
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleRejectUser = async (pendingUserId: string) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason?.trim()) {
      alert("Rejection reason is required");
      return;
    }

    setApprovalLoading(true);
    try {
      const response = (await api(
        `/api/admin/user-approval/reject-user/${pendingUserId}`,
        {
          method: "POST",
          json: { rejectionReason: reason },
        }
      )) as { success: boolean; message?: string };

      if (response.success) {
        // Refresh the data
        await Promise.all([
          fetchPendingUsers(),
          fetchApprovalStats(),
          fetchStats(),
        ]);
        alert("User rejected successfully!");
      } else {
        alert("Failed to reject user: " + response.message);
      }
    } catch (error) {
      console.error("Error rejecting user:", error);
      alert("Error rejecting user. Please try again.");
    } finally {
      setApprovalLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    // Mock recent activity data
    const mockActivity: ActivityItem[] = [
      {
        id: 1,
        action: "New user registered",
        user: "TechCorp Inc",
        time: "2 minutes ago",
        type: "user",
        icon: UsersIcon,
        color: "text-blue-500",
      },
      {
        id: 2,
        action: "Invoice generated",
        user: "StartupXYZ",
        time: "15 minutes ago",
        type: "invoice",
        icon: DocumentTextIcon,
        color: "text-green-500",
      },
      {
        id: 3,
        action: "Payment received",
        user: "Enterprise Ltd",
        time: "1 hour ago",
        type: "payment",
        icon: BanknotesIcon,
        color: "text-purple-500",
      },
      {
        id: 4,
        action: "Project created",
        user: "Digital Solutions",
        time: "2 hours ago",
        type: "project",
        icon: FolderIcon,
        color: "text-orange-500",
      },
      {
        id: 5,
        action: "Timesheet submitted",
        user: "Innovation Hub",
        time: "3 hours ago",
        type: "timesheet",
        icon: ClockIcon,
        color: "text-indigo-500",
      },
    ];
    setRecentActivity(mockActivity);
  };

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
    icon: ComponentType<{ className?: string }>;
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
          {pendingUsers.length} pending
        </span>
      </div>

      {pendingUsers.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-2" />
          <p className="text-gray-500">No pending approvals</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingUsers.map((user: any) => (
            <div
              key={user._id}
              className="border border-gray-200 rounded-lg p-4"
            >
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
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApproveUser(user._id)}
                  disabled={approvalLoading}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleRejectUser(user._id)}
                  disabled={approvalLoading}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  <XCircleIcon className="h-4 w-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
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
            {approvalStats.pendingApprovals}
          </div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {approvalStats.approvedUsers}
          </div>
          <div className="text-sm text-gray-500">Approved</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {approvalStats.rejectedUsers}
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
        {recentActivity.map((activity) => (
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
          subtitle="Registered accounts"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={UserGroupIcon}
          change="8.2"
          changeType="increase"
          color="bg-green-500"
          subtitle="Currently active"
        />
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          icon={CurrencyDollarIcon}
          change="15.3"
          changeType="increase"
          color="bg-purple-500"
          subtitle="From paid invoices"
        />
        <StatCard
          title="Monthly Growth"
          value={`${stats.monthlyGrowth}%`}
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
          value={stats.totalProjects}
          icon={FolderIcon}
          color="bg-indigo-500"
          subtitle="Created projects"
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          icon={CalendarIcon}
          color="bg-teal-500"
          subtitle="Currently running"
        />
        <StatCard
          title="Total Hours"
          value={stats.totalHours}
          icon={ClockIcon}
          color="bg-pink-500"
          subtitle="Logged time"
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivity />
        <QuickActions />
        <SystemHealth />
      </div>
    </div>
  );
}
