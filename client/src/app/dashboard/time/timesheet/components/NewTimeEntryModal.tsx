'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  User, 
  Briefcase, 
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  ChevronDown
} from 'lucide-react';

interface NewTimeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entryData: any) => void;
  editEntry?: any;
}

export default function NewTimeEntryModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editEntry 
}: NewTimeEntryModalProps) {
  const [formData, setFormData] = useState({
    task: '',
    project_id: '',
    project_name: '',
    user: '',
    date: new Date().toISOString().split('T')[0],
    hours: '',
    description: '',
    billable: true,
    status: 'pending'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProjectInput, setShowProjectInput] = useState(false);
  const [showUserInput, setShowUserInput] = useState(false);

  // Sample data - in real app, these would come from API
  const projects = [
    { id: '1', name: 'Website Redesign' },
    { id: '2', name: 'Mobile App Development' },
    { id: '3', name: 'Database Migration' },
    { id: '4', name: 'UI/UX Design' }
  ];

  const users = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Mike Johnson' },
    { id: '4', name: 'Sarah Wilson' }
  ];

  useEffect(() => {
    if (editEntry) {
      setFormData({
        task: editEntry.task || '',
        project_id: editEntry.project_id || '',
        project_name: editEntry.project_name || '',
        user: editEntry.user || '',
        date: editEntry.date ? new Date(editEntry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        hours: editEntry.hours?.toString() || '',
        description: editEntry.description || '',
        billable: editEntry.billable ?? true,
        status: editEntry.status || 'pending'
      });
    } else {
      setFormData({
        task: '',
        project_id: '',
        project_name: '',
        user: '',
        date: new Date().toISOString().split('T')[0],
        hours: '',
        description: '',
        billable: true,
        status: 'pending'
      });
    }
    setErrors({});
    setShowProjectInput(false);
    setShowUserInput(false);
  }, [editEntry, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.task.trim()) {
      newErrors.task = 'Task is required';
    }

    if (!formData.project_id && !formData.project_name) {
      newErrors.project_id = 'Project is required';
    }

    if (!formData.user) {
      newErrors.user = 'User is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.hours || parseFloat(formData.hours) <= 0) {
      newErrors.hours = 'Hours must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const entryData = {
        ...formData,
        hours: parseFloat(formData.hours),
        project_id: formData.project_id || `custom_${Date.now()}`,
        project_name: formData.project_name || formData.project_id,
        date: new Date(formData.date).toISOString(),
        billable: Boolean(formData.billable),
        status: formData.status || 'pending'
      };

      console.log('Submitting entry data:', entryData);
      await onSubmit(entryData);
      onClose();
    } catch (error) {
      console.error('Error submitting time entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleProjectChange = (value: string) => {
    if (value === 'custom') {
      setShowProjectInput(true);
      setFormData(prev => ({ ...prev, project_id: '', project_name: '' }));
    } else {
      setShowProjectInput(false);
      const project = projects.find(p => p.id === value);
      setFormData(prev => ({ 
        ...prev, 
        project_id: value, 
        project_name: project?.name || '' 
      }));
    }
  };

  const handleUserChange = (value: string) => {
    if (value === 'custom') {
      setShowUserInput(true);
      setFormData(prev => ({ ...prev, user: '' }));
    } else {
      setShowUserInput(false);
      setFormData(prev => ({ ...prev, user: value }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">
            {editEntry ? 'Edit Time Entry' : 'New Time Entry'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Task */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Task *
            </label>
            <input
              type="text"
              value={formData.task}
              onChange={(e) => handleInputChange('task', e.target.value)}
              className={`w-full px-3 py-2 text-xs border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                errors.task ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter task name"
            />
            {errors.task && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.task}
              </p>
            )}
          </div>

          {/* Project and User Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Project */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Project *
              </label>
              {showProjectInput ? (
                <div className="relative">
                  <Briefcase className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.project_name}
                    onChange={(e) => handleInputChange('project_name', e.target.value)}
                    className={`w-full pl-8 pr-3 py-2 text-xs border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.project_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter project name"
                  />
                </div>
              ) : (
                <div className="relative">
                  <Briefcase className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <select
                    value={formData.project_id}
                    onChange={(e) => handleProjectChange(e.target.value)}
                    className={`w-full pl-8 pr-8 py-2 text-xs border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.project_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                    <option value="custom">+ Add New Project</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                </div>
              )}
              {errors.project_id && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.project_id}
                </p>
              )}
            </div>

            {/* User */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                User *
              </label>
              {showUserInput ? (
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.user}
                    onChange={(e) => handleInputChange('user', e.target.value)}
                    className={`w-full pl-8 pr-3 py-2 text-xs border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.user ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter user name"
                  />
                </div>
              ) : (
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <select
                    value={formData.user}
                    onChange={(e) => handleUserChange(e.target.value)}
                    className={`w-full pl-8 pr-8 py-2 text-xs border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.user ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a user</option>
                    {users.map(user => (
                      <option key={user.id} value={user.name}>
                        {user.name}
                      </option>
                    ))}
                    <option value="custom">+ Add New User</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                </div>
              )}
              {errors.user && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.user}
                </p>
              )}
            </div>
          </div>

          {/* Date and Hours Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={`w-full pl-8 pr-3 py-2 text-xs border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.date && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.date}
                </p>
              )}
            </div>

            {/* Hours */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Hours *
              </label>
              <div className="relative">
                <Clock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={formData.hours}
                  onChange={(e) => handleInputChange('hours', e.target.value)}
                  className={`w-full pl-8 pr-3 py-2 text-xs border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.hours ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.hours && (
                <p className="mt-1 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.hours}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter description (optional)"
            />
          </div>

          {/* Billable Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-xs font-medium text-gray-700">Billable</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.billable}
                onChange={(e) => handleInputChange('billable', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : (editEntry ? 'Update Entry' : 'Create Entry')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
