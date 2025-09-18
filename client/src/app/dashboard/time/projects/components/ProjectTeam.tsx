"use client";

import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  UserIcon,
  UserGroupIcon,
  EnvelopeIcon,
  PhoneIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { useProjectSync } from '../../../../../services/projectSyncService';

interface TeamMember {
  _id: string;
  projectId: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  department?: string;
  hourlyRate?: number;
  isActive: boolean;
  joinedDate: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectTeamProps {
  projectId: string;
  projectName: string;
  existingMembers?: string[];
}

const teamRoles = [
  'Project Manager',
  'Developer',
  'Designer',
  'QA Tester',
  'Business Analyst',
  'Consultant',
  'Other'
];

const departments = [
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'Support',
  'Management',
  'Other'
];

export default function ProjectTeam({ projectId, projectName, existingMembers = [] }: ProjectTeamProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const { syncTeamMember } = useProjectSync();

  // Fetch team members for this project
  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/team`);
      if (response.ok) {
        const data = await response.json();
        // Ensure we always set an array
        const teamMembersData = data?.data || data || [];
        setTeamMembers(Array.isArray(teamMembersData) ? teamMembersData : []);
      } else {
        console.error('Failed to fetch team members:', response.status);
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, [projectId]);

  // Add team member
  const handleAddTeamMember = async (memberData: Partial<TeamMember>) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...memberData,
          projectId,
        }),
      });

      if (response.ok) {
        const newMember = await response.json();
        await fetchTeamMembers();
        setShowAddModal(false);
        // Sync with main application
        syncTeamMember(newMember.data || newMember, projectId);
      }
    } catch (error) {
      console.error('Error adding team member:', error);
    }
  };

  // Update team member
  const handleUpdateTeamMember = async (memberData: Partial<TeamMember>) => {
    if (!editingMember) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/team/${editingMember._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
      });

      if (response.ok) {
        await fetchTeamMembers();
        setShowEditModal(false);
        setEditingMember(null);
      }
    } catch (error) {
      console.error('Error updating team member:', error);
    }
  };

  // Remove team member
  const handleRemoveTeamMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/team/${memberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTeamMembers();
        setDeletingMemberId(null);
      }
    } catch (error) {
      console.error('Error removing team member:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const activeMembers = teamMembers.filter(member => member.isActive);
  const inactiveMembers = teamMembers.filter(member => !member.isActive);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Add Member
        </button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Members</p>
              <p className="text-2xl font-semibold text-gray-900">
                {teamMembers.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <UserIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-semibold text-gray-900">
                {activeMembers.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <BriefcaseIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Roles</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Set(teamMembers.map(m => m.role)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Members */}
      {activeMembers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Members</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeMembers.map((member) => (
              <div key={member._id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {getInitials(member.name)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-gray-900">{member.name}</h4>
                      <p className="text-sm text-gray-600">{member.role}</p>
                      {member.department && (
                        <p className="text-xs text-gray-500">{member.department}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setEditingMember(member);
                        setShowEditModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Edit Member"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingMemberId(member._id)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Remove Member"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    <span>{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  {member.hourlyRate && (
                    <div className="flex items-center text-sm text-gray-600">
                      <BriefcaseIcon className="h-4 w-4 mr-2" />
                      <span>{formatCurrency(member.hourlyRate)}/hour</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Joined {formatDate(member.joinedDate)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inactive Members */}
      {inactiveMembers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inactive Members</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactiveMembers.map((member) => (
              <div key={member._id} className="bg-gray-50 rounded-lg shadow p-6 opacity-75">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-500 font-semibold text-lg">
                        {getInitials(member.name)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-gray-700">{member.name}</h4>
                      <p className="text-sm text-gray-500">{member.role}</p>
                      {member.department && (
                        <p className="text-xs text-gray-400">{member.department}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setEditingMember(member);
                        setShowEditModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Edit Member"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingMemberId(member._id)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Remove Member"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {teamMembers.length === 0 && (
        <div className="text-center py-12">
          <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
          <p className="text-gray-500 mb-4">Add team members to collaborate on this project</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Team Member
          </button>
        </div>
      )}

      {/* Add Team Member Modal */}
      {showAddModal && (
        <AddTeamMemberModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddTeamMember}
          projectName={projectName}
        />
      )}

      {/* Edit Team Member Modal */}
      {showEditModal && editingMember && (
        <AddTeamMemberModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingMember(null);
          }}
          onSubmit={handleUpdateTeamMember}
          projectName={projectName}
          initialData={editingMember}
          title="Edit Team Member"
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingMemberId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Remove Team Member</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to remove this team member from the project? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeletingMemberId(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveTeamMember(deletingMemberId)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add Team Member Modal Component
interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<TeamMember>) => void;
  projectName: string;
  initialData?: TeamMember | null;
  title?: string;
}

function AddTeamMemberModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  projectName, 
  initialData, 
  title = "Add Team Member" 
}: AddTeamMemberModalProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    role: initialData?.role || 'Developer',
    phone: initialData?.phone || '',
    department: initialData?.department || 'Engineering',
    hourlyRate: initialData?.hourlyRate || 0,
    isActive: initialData?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {teamRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hourly Rate (?)
              </label>
              <input
                type="number"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Active member
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {title === "Edit Team Member" ? "Update Member" : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
