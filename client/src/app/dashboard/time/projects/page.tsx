"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon,
  ClockIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  CalendarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  EllipsisHorizontalIcon,
  ListBulletIcon,
  Squares2X2Icon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import ProjectDetail from './components/ProjectDetail';
import { projectApi, Project, ProjectDetails, Task, TimeEntry, Invoice, Expense } from '@/lib/api';

export default function ProjectsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [projects, setProjects] = useState<ProjectDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    startDate: '',
    endDate: '',
    budget: '',
    status: 'active',
    description: '',
    teamMembers: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  // Load projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await projectApi.list();
        // Convert Project[] to ProjectDetails[] by adding empty arrays for related entities
        const projectDetails: ProjectDetails[] = data.map(project => ({
          ...project,
          tasks: [],
          timeEntries: [],
          invoices: [],
          expenses: []
        }));
        setProjects(projectDetails);
        setIsAuthenticated(true); // If we can fetch projects, user is authenticated
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
        if (errorMessage.includes('401') || errorMessage.includes('No token provided')) {
          // Redirect to login if not authenticated
          router.push('/signin');
          return;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [router]);

  const dummyProjects: ProjectDetails[] = [
    {
      _id: '1',
      user_id: 'user1',
      name: 'Website Redesign',
      client: 'ABC Corporation',
      status: 'active',
      progress: 75,
      budget: 15000,
      spent: 11250,
      startDate: '2024-01-15',
      endDate: '2024-03-15',
      teamMembers: ['John Doe', 'Jane Smith', 'Mike Johnson'],
      description: 'Complete redesign of the company website with modern UI/UX',
      tasks: [
        {
          _id: '1',
          project_id: '1',
          name: 'Design Mockups',
          status: 'completed',
          assignedTo: 'Jane Smith',
          estimatedHours: 40,
          actualHours: 38,
          dueDate: '2024-02-01',
          description: 'Create wireframes and design mockups for the website',
          createdAt: '2024-01-15',
          updatedAt: '2024-02-01'
        },
        {
          _id: '2',
          project_id: '1',
          name: 'Frontend Development',
          status: 'in-progress',
          assignedTo: 'John Doe',
          estimatedHours: 80,
          actualHours: 45,
          dueDate: '2024-02-28',
          description: 'Develop the frontend components and pages',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-25'
        }
      ],
      timeEntries: [
        {
          _id: '1',
          project_id: '1',
          task: 'Design Mockups',
          user: 'Jane Smith',
          date: '2024-01-20',
          hours: 8,
          description: 'Created initial wireframes',
          billable: true,
          createdAt: '2024-01-20',
          updatedAt: '2024-01-20'
        },
        {
          _id: '2',
          project_id: '1',
          task: 'Design Mockups',
          user: 'Jane Smith',
          date: '2024-01-21',
          hours: 6,
          description: 'Refined design mockups',
          billable: true,
          createdAt: '2024-01-21',
          updatedAt: '2024-01-21'
        },
        {
          _id: '3',
          project_id: '1',
          task: 'Frontend Development',
          user: 'John Doe',
          date: '2024-01-25',
          hours: 7,
          description: 'Started homepage development',
          billable: true,
          createdAt: '2024-01-25',
          updatedAt: '2024-01-25'
        }
      ],
      invoices: [
        {
          _id: '1',
          project_id: '1',
          number: 'INV-001',
          date: '2024-01-25',
          amount: 5000,
          status: 'paid',
          dueDate: '2024-02-25',
          createdAt: '2024-01-25',
          updatedAt: '2024-01-25'
        },
        {
          _id: '2',
          project_id: '1',
          number: 'INV-002',
          date: '2024-02-15',
          amount: 7500,
          status: 'sent',
          dueDate: '2024-03-15',
          createdAt: '2024-02-15',
          updatedAt: '2024-02-15'
        }
      ],
      expenses: [
        {
          _id: '1',
          project_id: '1',
          description: 'Design software license',
          amount: 299,
          date: '2024-01-20',
          category: 'equipment',
          status: 'approved',
          createdAt: '2024-01-20',
          updatedAt: '2024-01-20'
        },
        {
          _id: '2',
          project_id: '1',
          description: 'Team lunch meeting',
          amount: 150,
          date: '2024-02-10',
          category: 'meals',
          status: 'approved',
          createdAt: '2024-02-10',
          updatedAt: '2024-02-10'
        }
      ],
      revenue: 18000,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-25'
    },
    {
      _id: '2',
      user_id: 'user1',
      name: 'Mobile App Development',
      client: 'TechStart Inc',
      status: 'active',
      progress: 45,
      budget: 25000,
      spent: 11250,
      startDate: '2024-02-01',
      endDate: '2024-05-01',
      teamMembers: ['Sarah Wilson', 'Alex Brown'],
      description: 'iOS and Android mobile application development',
      tasks: [
        {
          _id: '3',
          project_id: '2',
          name: 'UI/UX Design',
          status: 'completed',
          assignedTo: 'Sarah Wilson',
          estimatedHours: 60,
          actualHours: 55,
          dueDate: '2024-02-15',
          description: 'Design user interface and user experience',
          createdAt: '2024-02-01',
          updatedAt: '2024-02-15'
        },
        {
          _id: '4',
          project_id: '2',
          name: 'iOS Development',
          status: 'in-progress',
          assignedTo: 'Alex Brown',
          estimatedHours: 120,
          actualHours: 65,
          dueDate: '2024-04-01',
          description: 'Develop iOS mobile application',
          createdAt: '2024-02-01',
          updatedAt: '2024-02-20'
        }
      ],
      timeEntries: [
        {
          _id: '4',
          project_id: '2',
          task: 'UI/UX Design',
          user: 'Sarah Wilson',
          date: '2024-02-10',
          hours: 8,
          description: 'Created app wireframes',
          billable: true,
          createdAt: '2024-02-10',
          updatedAt: '2024-02-10'
        },
        {
          _id: '5',
          project_id: '2',
          task: 'iOS Development',
          user: 'Alex Brown',
          date: '2024-02-20',
          hours: 6,
          description: 'Started iOS development',
          billable: true,
          createdAt: '2024-02-20',
          updatedAt: '2024-02-20'
        }
      ],
      invoices: [
        {
          _id: '3',
          project_id: '2',
          number: 'INV-003',
          date: '2024-02-20',
          amount: 10000,
          status: 'paid',
          dueDate: '2024-03-20',
          createdAt: '2024-02-20',
          updatedAt: '2024-02-20'
        },
        {
          _id: '4',
          project_id: '2',
          number: 'INV-004',
          date: '2024-03-01',
          amount: 15000,
          status: 'draft',
          dueDate: '2024-04-01',
          createdAt: '2024-03-01',
          updatedAt: '2024-03-01'
        }
      ],
      expenses: [
        {
          _id: '3',
          project_id: '2',
          description: 'Development tools subscription',
          amount: 199,
          date: '2024-02-05',
          category: 'equipment',
          status: 'approved',
          createdAt: '2024-02-05',
          updatedAt: '2024-02-05'
        },
        {
          _id: '4',
          project_id: '2',
          description: 'App store developer account',
          amount: 99,
          date: '2024-02-15',
          category: 'equipment',
          status: 'approved',
          createdAt: '2024-02-15',
          updatedAt: '2024-02-15'
        }
      ],
      revenue: 25000,
      createdAt: '2024-02-01',
      updatedAt: '2024-02-20'
    },
    {
      _id: '3',
      user_id: 'user1',
      name: 'E-commerce Platform',
      client: 'Retail Solutions',
      status: 'completed',
      progress: 100,
      budget: 30000,
      spent: 28500,
      startDate: '2023-11-01',
      endDate: '2024-01-31',
      teamMembers: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'],
      description: 'Full-stack e-commerce platform with payment integration',
      tasks: [
        {
          _id: '5',
          project_id: '3',
          name: 'Backend API',
          status: 'completed',
          assignedTo: 'Mike Johnson',
          estimatedHours: 100,
          actualHours: 95,
          dueDate: '2023-12-15',
          description: 'Develop backend API and database',
          createdAt: '2023-11-01',
          updatedAt: '2023-12-15'
        },
        {
          _id: '6',
          project_id: '3',
          name: 'Frontend Development',
          status: 'completed',
          assignedTo: 'John Doe',
          estimatedHours: 120,
          actualHours: 115,
          dueDate: '2024-01-15',
          description: 'Develop frontend application',
          createdAt: '2023-11-01',
          updatedAt: '2024-01-15'
        }
      ],
      timeEntries: [
        {
          _id: '6',
          project_id: '3',
          task: 'Backend API',
          user: 'Mike Johnson',
          date: '2023-12-10',
          hours: 8,
          description: 'Database design and setup',
          billable: true,
          createdAt: '2023-12-10',
          updatedAt: '2023-12-10'
        },
        {
          _id: '7',
          project_id: '3',
          task: 'Frontend Development',
          user: 'John Doe',
          date: '2024-01-10',
          hours: 7,
          description: 'User interface development',
          billable: true,
          createdAt: '2024-01-10',
          updatedAt: '2024-01-10'
        }
      ],
      invoices: [
        {
          _id: '5',
          project_id: '3',
          number: 'INV-005',
          date: '2023-12-20',
          amount: 15000,
          status: 'paid',
          dueDate: '2024-01-20',
          createdAt: '2023-12-20',
          updatedAt: '2023-12-20'
        },
        {
          _id: '6',
          project_id: '3',
          number: 'INV-006',
          date: '2024-01-15',
          amount: 15000,
          status: 'paid',
          dueDate: '2024-02-15',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-15'
        }
      ],
      expenses: [
        {
          _id: '5',
          project_id: '3',
          description: 'Server hosting setup',
          amount: 500,
          date: '2023-12-05',
          category: 'equipment',
          status: 'approved',
          createdAt: '2023-12-05',
          updatedAt: '2023-12-05'
        },
        {
          _id: '6',
          project_id: '3',
          description: 'Payment gateway integration',
          amount: 299,
          date: '2024-01-10',
          category: 'equipment',
          status: 'approved',
          createdAt: '2024-01-10',
          updatedAt: '2024-01-10'
        }
      ],
      revenue: 30000,
      createdAt: '2023-11-01',
      updatedAt: '2024-01-31'
    }
  ];

  const filters = [
    { id: 'all', label: 'All Projects' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'on-hold', label: 'On Hold' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || project.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">
          <ExclamationTriangleIcon className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Projects</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleCreateProject();
  };

  const handleCreateProject = async () => {
    try {
      setIsCreating(true);
      
      // Validate required fields
      if (!formData.name || !formData.client || !formData.startDate || !formData.endDate) {
        alert('Please fill in all required fields');
        return;
      }

      // Validate dates
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (startDate >= endDate) {
        alert('End date must be after start date');
        return;
      }

      // Parse team members
      const teamMembers = formData.teamMembers
        .split(',')
        .map(member => member.trim())
        .filter(member => member.length > 0);

      const projectData = {
        name: formData.name.trim(),
        client: formData.client.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: parseFloat(formData.budget) || 0,
        status: formData.status as 'active' | 'completed' | 'on-hold' | 'cancelled',
        description: formData.description.trim(),
        teamMembers: teamMembers,
        progress: 0,
        spent: 0,
        revenue: 0
      };

      const newProject = await projectApi.create(projectData);
      
      // Add the new project to the list (convert to ProjectDetails)
      const newProjectDetails: ProjectDetails = {
        ...newProject,
        tasks: [],
        timeEntries: [],
        invoices: [],
        expenses: []
      };
      setProjects(prev => [newProjectDetails, ...prev]);
      
      // Reset form and close modal
      setFormData({
        name: '',
        client: '',
        startDate: '',
        endDate: '',
        budget: '',
        status: 'active',
        description: '',
        teamMembers: ''
      });
      setShowCreateProject(false);
      
         } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'Failed to create project. Please try again.';
      
      if (errorMessage.includes('401') || errorMessage.includes('No token provided')) {
        // Redirect to login if not authenticated
        alert('Please log in to create projects');
        router.push('/signin');
        return;
      }
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  const CreateProjectModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Create New Project</h3>
          <button
            onClick={() => setShowCreateProject(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        

        
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                             <input
                 type="text"
                 name="name"
                 value={formData.name}
                 onChange={handleInputChange}
                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 placeholder="Enter project name"
                 required
                 autoComplete="off"
                 spellCheck="false"
               />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                             <input
                 type="text"
                 name="client"
                 value={formData.client}
                 onChange={handleInputChange}
                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 placeholder="Enter client name"
                 required
                 autoComplete="off"
                 spellCheck="false"
               />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter budget amount"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter project description"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Members</label>
                         <input
               type="text"
               name="teamMembers"
               value={formData.teamMembers}
               onChange={handleInputChange}
               className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               placeholder="Enter team member names (comma separated)"
               autoComplete="off"
               spellCheck="false"
             />
          </div>
        
        <div className="mt-6 flex gap-3">
          <button 
            type="submit"
            disabled={isCreating}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              'Create Project'
            )}
          </button>
          <button 
            type="button"
            onClick={() => setShowCreateProject(false)}
            disabled={isCreating}
            className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/time')}
            className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
          >
            ← Back to Time
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600">Manage your projects and track time efficiently</p>
          </div>
        </div>
        {isAuthenticated ? (
          <button
            onClick={() => setShowCreateProject(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            New Project
          </button>
        ) : (
          <button
            onClick={() => router.push('/signin')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Login to Create Project
          </button>
        )}
      </div>

      {/* Authentication Notice */}
      {!isAuthenticated && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800">
              Please <button onClick={() => router.push('/signin')} className="underline font-medium">log in</button> to create and manage projects.
            </p>
          </div>
        </div>
      )}

      {/* Project Lifecycle Info */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Life cycle of a Project</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <UserGroupIcon className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">CUSTOMER</span>
            </div>
            
            <div className="h-0.5 w-8 bg-gray-300"></div>
            
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <DocumentTextIcon className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">PROJECT</span>
            </div>
            
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <div className="h-0.5 w-4 bg-gray-300"></div>
                <div className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <DocumentTextIcon className="h-3 w-3 text-purple-600" />
                </div>
                <span className="text-xs text-gray-600">RETAINER INVOICES</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="h-0.5 w-4 bg-gray-300"></div>
                <div className="h-6 w-6 bg-yellow-100 rounded-full flex items-center justify-center">
                  <ClockIcon className="h-3 w-3 text-yellow-600" />
                </div>
                <span className="text-xs text-gray-600">LOG TIME USING TIMER</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="h-0.5 w-4 bg-gray-300"></div>
                <div className="h-6 w-6 bg-red-100 rounded-full flex items-center justify-center">
                  <CurrencyDollarIcon className="h-3 w-3 text-red-600" />
                </div>
                <span className="text-xs text-gray-600">PROJECT EXPENSE</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <DocumentTextIcon className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">INVOICES</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select 
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {filters.map(filter => (
                <option key={filter.id} value={filter.id}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects List/Grid */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Projects</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredProjects.map((project) => (
              <div key={project._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{project.name}</h4>
                      <p className="text-sm text-gray-500">{project.client}</p>
                      <p className="text-xs text-gray-400 mt-1">{project.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">{project.progress}%</div>
                      <div className="text-xs text-gray-500">Progress</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">
                        ${project.spent.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Spent</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">
                        ${project.budget.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Budget</div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    
                                         <div className="flex items-center space-x-2">
                       <button className="p-2 text-gray-400 hover:text-blue-600 rounded">
                         <PlayIcon className="h-4 w-4" />
                       </button>
                                               <button 
                          onClick={() => {
                            setSelectedProjectId(project._id);
                            setShowProjectDetail(true);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                       <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
                         <PencilIcon className="h-4 w-4" />
                       </button>
                       <button className="p-2 text-gray-400 hover:text-red-600 rounded">
                         <TrashIcon className="h-4 w-4" />
                       </button>
                     </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project._id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              
              <h4 className="font-semibold text-gray-900 mb-1">{project.name}</h4>
              <p className="text-sm text-gray-500 mb-3">{project.client}</p>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Budget</span>
                  <span className="font-medium">${project.budget.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Spent</span>
                  <span className="font-medium">${project.spent.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>Team Members</span>
                  <span>{project.teamMembers.length}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {project.teamMembers.slice(0, 3).map((member, index) => (
                    <div key={index} className="h-6 w-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                      {member.charAt(0)}
                    </div>
                  ))}
                  {project.teamMembers.length > 3 && (
                    <span className="text-xs text-gray-500">+{project.teamMembers.length - 3}</span>
                  )}
                </div>
                
                                 <div className="flex items-center gap-2 mt-4">
                   <button className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded border border-blue-200 text-sm">
                     <PlayIcon className="h-4 w-4 inline mr-1" />
                     Start
                   </button>
                                       <button 
                      onClick={() => {
                        setSelectedProjectId(project._id);
                        setShowProjectDetail(true);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                   <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
                     <EllipsisHorizontalIcon className="h-4 w-4" />
                   </button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateProject && <CreateProjectModal />}
      {showProjectDetail && selectedProjectId && (
        <ProjectDetail 
          projectId={selectedProjectId} 
          onClose={() => {
            setShowProjectDetail(false);
            setSelectedProjectId(null);
          }} 
        />
      )}
    </div>
  );
} 