'use client';

import React from 'react';
import { Clock, DollarSign, TrendingUp, Activity } from 'lucide-react';

interface TimesheetStatsProps {
  timesheets: any[];
}

export default function TimesheetStats({ timesheets }: TimesheetStatsProps) {
  const calculateStats = () => {
    // Ensure timesheets is an array and handle edge cases
    const timesheetsArray = Array.isArray(timesheets) ? timesheets : [];
    
    const totalHours = timesheetsArray.reduce((sum, entry) => {
      const hours = typeof entry?.hours === 'number' ? entry.hours : 0;
      return sum + hours;
    }, 0);
    
    const billableHours = timesheetsArray
      .filter(entry => entry && typeof entry.billable === 'boolean' && entry.billable)
      .reduce((sum, entry) => {
        const hours = typeof entry?.hours === 'number' ? entry.hours : 0;
        return sum + hours;
      }, 0);
      
    const activeEntries = timesheetsArray.filter(entry => 
      entry && typeof entry.status === 'string' && entry.status === 'active'
    ).length;
    
    // Calculate this week's hours (mock calculation)
    const thisWeekHours = timesheetsArray
      .filter(entry => {
        if (!entry || !entry.date) return false;
        try {
          const entryDate = new Date(entry.date);
          const now = new Date();
          const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
          return entryDate >= weekStart;
        } catch (error) {
          return false;
        }
      })
      .reduce((sum, entry) => {
        const hours = typeof entry?.hours === 'number' ? entry.hours : 0;
        return sum + hours;
      }, 0);

    return {
      totalHours: totalHours.toFixed(1),
      billableHours: billableHours.toFixed(1),
      thisWeekHours: thisWeekHours.toFixed(1),
      activeEntries
    };
  };

  const stats = calculateStats();

  const statCards = [
    {
      title: 'Total Hours',
      value: stats.totalHours,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Billable Hours',
      value: stats.billableHours,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'This Week',
      value: stats.thisWeekHours,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Active Entries',
      value: stats.activeEntries.toString(),
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((stat, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
            <div className={`p-2 rounded-md ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">{stat.title}</p>
              <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
