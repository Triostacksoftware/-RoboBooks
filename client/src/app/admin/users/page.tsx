/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Swal from "sweetalert2";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  ArrowDownTrayIcon,
  TableCellsIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

export default function AdminUsers() {
  interface AdminUser {
    id: string;
    companyName: string;
    email: string;
    phone?: string;
    country?: string;
    state?: string;
    isActive: boolean;
    createdAt: string | Date;
    lastLogin?: string | Date;
  }
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const [sortField, setSortField] = useState<keyof AdminUser>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api("/api/admin/users");

      if (
        typeof response === "object" &&
        response !== null &&
        "success" in response
      ) {
        if ((response as any).success) {
          setUsers((response as any).users || []);
        } else {
          setError("Failed to fetch users");
        }
      } else {
        setError("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again.");

      // For development/testing, add some mock data if API fails
      if (process.env.NODE_ENV === "development") {
        const mockUsers = [
          {
            id: "1",
            companyName: "TechCorp Inc",
            email: "admin@techcorp.com",
            phone: "+91 9876543210",
            country: "India",
            state: "Maharashtra",
            isActive: true,
            createdAt: new Date("2024-01-15"),
            lastLogin: new Date("2024-01-20"),
          },
          {
            id: "2",
            companyName: "StartupXYZ",
            email: "contact@startupxyz.com",
            phone: "+91 8765432109",
            country: "India",
            state: "Karnataka",
            isActive: true,
            createdAt: new Date("2024-01-10"),
            lastLogin: new Date("2024-01-19"),
          },
          {
            id: "3",
            companyName: "Enterprise Ltd",
            email: "info@enterprise.com",
            phone: "+91 7654321098",
            country: "India",
            state: "Delhi",
            isActive: false,
            createdAt: new Date("2024-01-05"),
            lastLogin: new Date("2024-01-15"),
          },
          {
            id: "4",
            companyName: "Digital Solutions",
            email: "hello@digitalsolutions.com",
            phone: "+91 6543210987",
            country: "India",
            state: "Tamil Nadu",
            isActive: true,
            createdAt: new Date("2024-01-20"),
            lastLogin: new Date("2024-01-21"),
          },
          {
            id: "5",
            companyName: "Innovation Hub",
            email: "team@innovationhub.com",
            phone: "+91 5432109876",
            country: "India",
            state: "Telangana",
            isActive: true,
            createdAt: new Date("2024-01-12"),
            lastLogin: new Date("2024-01-18"),
          },
        ];
        setUsers(mockUsers);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    const user = users.find((u) => u.id === userId);

    const result = await Swal.fire({
      title: "Confirm Status Change",
      text: `Are you sure you want to ${
        currentStatus ? "deactivate" : "activate"
      } ${user?.companyName || "this user"}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: currentStatus ? "#d33" : "#28a745",
      cancelButtonColor: "#6c757d",
      confirmButtonText: currentStatus ? "Deactivate" : "Activate",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await api(`/api/admin/users/${userId}/status`, {
          method: "PUT",
          body: JSON.stringify({ isActive: !currentStatus }),
        });

        // Fix: response is of type unknown, so we need to check its shape
        if (
          typeof response === "object" &&
          response !== null &&
          "success" in response &&
          (response as any).success
        ) {
          setUsers(
            users.map((user) =>
              user.id === userId ? { ...user, isActive: !currentStatus } : user
            )
          );

          // Show success toast
          Swal.fire({
            icon: "success",
            title: "Status Updated!",
            text: `${user?.companyName || "User"} has been ${
              !currentStatus ? "activated" : "deactivated"
            } successfully.`,
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
        }
      } catch (error) {
        console.error("Error updating user status:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Failed to update user status. Please try again.",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const user = users.find((u) => u.id === userId);

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete ${
        user?.companyName || "this user"
      }? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await api(`/api/admin/users/${userId}`, {
          method: "DELETE",
        });

        if (
          typeof response === "object" &&
          response !== null &&
          "success" in response &&
          (response as any).success
        ) {
          setUsers(users.filter((user) => user.id !== userId));

          // Show success toast
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "User has been deleted successfully.",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Failed to delete user. Please try again.",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
    }
  };

  const handleSort = (field: keyof AdminUser) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const exportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = filteredUsers.map((user) => ({
        "Company Name": user.companyName,
        Email: user.email,
        Phone: user.phone || "",
        Country: user.country || "",
        State: user.state || "",
        Status: user.isActive ? "Active" : "Inactive",
        "Created Date": new Date(user.createdAt).toLocaleDateString(),
        "Last Login": user.lastLogin
          ? new Date(user.lastLogin).toLocaleDateString()
          : "",
      }));

      // Convert to CSV format
      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(","),
        ...exportData.map((row) =>
          headers
            .map((header) => {
              const value = row[header as keyof typeof row];
              // Escape commas and quotes in CSV
              return `"${String(value).replace(/"/g, '""')}"`;
            })
            .join(",")
        ),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `users_export_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success toast
      Swal.fire({
        icon: "success",
        title: "Export Successful!",
        text: "Users data has been exported to Excel format.",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      Swal.fire({
        icon: "error",
        title: "Export Failed!",
        text: "Failed to export users data. Please try again.",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || user.isActive === (filterStatus === "active");
    return matchesSearch && matchesFilter;
  });

  // Sort filtered users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === bValue) return 0;

    let comparison = 0;
    if (typeof aValue === "string" && typeof bValue === "string") {
      comparison = aValue.localeCompare(bValue);
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    } else if (typeof aValue === "boolean" && typeof bValue === "boolean") {
      comparison = aValue === bValue ? 0 : aValue ? 1 : -1;
    } else {
      comparison = String(aValue).localeCompare(String(bValue));
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const UserCard = ({ user }: { user: AdminUser }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {user.companyName}
            </h3>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-xs text-gray-500">{user.phone}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              user.isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {user.isActive ? "Active" : "Inactive"}
          </span>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Country</p>
            <p className="font-medium">{user.country}</p>
          </div>
          <div>
            <p className="text-gray-500">State</p>
            <p className="font-medium">{user.state}</p>
          </div>
          <div>
            <p className="text-gray-500">Joined</p>
            <p className="font-medium">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 flex space-x-2">
        <button className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">
          <EyeIcon className="h-4 w-4" />
          <span>View</span>
        </button>
        <button
          className="flex items-center justify-center px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
          title="Edit"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleStatusToggle(user.id, user.isActive)}
          className={`flex items-center space-x-1 px-3 py-1 text-sm rounded-lg ${
            user.isActive
              ? "text-orange-600 hover:bg-orange-50"
              : "text-green-600 hover:bg-green-50"
          }`}
        >
          <span>{user.isActive ? "Deactivate" : "Activate"}</span>
        </button>
        <button
          onClick={() => handleDeleteUser(user.id)}
          className="flex items-center justify-center px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg"
          title="Delete"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const UserTable = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-full">
      <div className="overflow-x-auto max-w-full">
        <table className="min-w-full divide-y divide-gray-200 max-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort("companyName")}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 min-w-0"
              >
                <div className="flex items-center space-x-1">
                  <span>Company Name</span>
                  {sortField === "companyName" && (
                    <span className="text-gray-400">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort("email")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>Email</span>
                  {sortField === "email" && (
                    <span className="text-gray-400">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Country
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                State
              </th>
              <th
                onClick={() => handleSort("isActive")}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  {sortField === "isActive" && (
                    <span className="text-gray-400">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort("createdAt")}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>Created Date</span>
                  {sortField === "createdAt" && (
                    <span className="text-gray-400">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                      <UserIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {user.companyName}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.phone || "-"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.country || "-"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.state || "-"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      title="View"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      className="text-gray-600 hover:text-gray-900"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleStatusToggle(user.id, user.isActive)}
                      className={`${
                        user.isActive
                          ? "text-orange-600 hover:text-orange-900"
                          : "text-green-600 hover:text-green-900"
                      }`}
                      title={user.isActive ? "Deactivate" : "Activate"}
                    >
                      <span className="text-xs">
                        {user.isActive ? "Deactivate" : "Activate"}
                      </span>
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchUsers}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 truncate">
            Users Management
          </h1>
          <p className="text-gray-600 mt-1">Manage all registered users</p>
        </div>
        <div className="flex items-center space-x-4 flex-shrink-0">
          <span className="text-sm text-gray-500">
            {filteredUsers.length} of {users.length} users
          </span>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by company name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Users</option>
                <option value="active">Active Users</option>
                <option value="inactive">Inactive Users</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "table"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="Table View"
              >
                <TableCellsIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "cards"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="Card View"
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
            </div>

            {/* Export Button */}
            <button
              onClick={exportToExcel}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users Display */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No users found
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your search or filter criteria"
              : "No users have been registered yet"}
          </p>
        </div>
      ) : viewMode === "table" ? (
        <UserTable />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-full">
          {sortedUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500 rounded-lg">
              <UserIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-500 rounded-lg">
              <UserIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.isActive).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-500 rounded-lg">
              <UserIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Inactive Users
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => !u.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
