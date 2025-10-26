// Stats Cards Component
'use client';

import { BarChart3, Target, CheckCircle2, Plus, FileUp, BookOpen } from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalProjects: number;
    activeProjects: number;
    completedTasks: number;
    nearDeadline: number;
  };
  onCreateProject: () => void;
  onImport: () => void;
  onTemplates: () => void;
  canCreate?: boolean;
  limitReason?: string;
  isChecking?: boolean;
}

export default function StatsCards({ stats, onCreateProject, onImport, onTemplates, canCreate = true, limitReason, isChecking = false }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Stats Card */}
      <div className="glass-card p-6 hover:scale-[1.02] transition-transform">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Projects</h3>
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <BarChart3 size={24} className="text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalProjects}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">All time</p>
      </div>

      {/* Active Projects */}
      <div className="glass-card p-6 hover:scale-[1.02] transition-transform">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Projects</h3>
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Target size={24} className="text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <p className="text-3xl font-bold text-blue-600">{stats.activeProjects}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">In progress</p>
      </div>

      {/* Completed Tasks */}
      <div className="glass-card p-6 hover:scale-[1.02] transition-transform">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Tasks Done</h3>
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <CheckCircle2 size={24} className="text-green-600 dark:text-green-400" />
          </div>
        </div>
        <p className="text-3xl font-bold text-green-600">{stats.completedTasks}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total completed</p>
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-6 hover:scale-[1.02] transition-transform">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4 flex items-center space-x-2">
          <Target size={16} className="text-gray-600 dark:text-gray-400" />
          <span>Quick Actions</span>
        </h3>
        <div className="space-y-2">
          <button
            onClick={onCreateProject}
            disabled={!canCreate || isChecking}
            className={`w-full text-sm py-2 flex items-center justify-center space-x-2 transition-all ${
              isChecking
                ? 'bg-gray-200 text-gray-500 cursor-wait'
                : canCreate 
                ? 'btn-primary' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
            }`}
            title={!canCreate ? limitReason : undefined}
          >
            {isChecking ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                <span>Checking...</span>
              </>
            ) : canCreate ? (
              <>
                <Plus size={16} />
                <span>New Project</span>
              </>
            ) : (
              <span>🔒 No Subscription</span>
            )}
          </button>
          <button 
            onClick={onImport}
            className="w-full text-sm py-2 px-4 flex items-center justify-center space-x-2 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400 font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600 transition-all shadow-sm hover:shadow-md"
          >
            <FileUp size={16} />
            <span>Import</span>
          </button>
          <button 
            onClick={onTemplates}
            className="w-full text-sm py-2 px-4 flex items-center justify-center space-x-2 bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-400 font-medium rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-300 dark:hover:border-purple-600 transition-all shadow-sm hover:shadow-md"
          >
            <BookOpen size={16} />
            <span>Templates</span>
          </button>
        </div>
      </div>
    </div>
  );
}

