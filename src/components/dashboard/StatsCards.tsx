// Stats Cards Component
'use client';

interface StatsCardsProps {
  stats: {
    totalProjects: number;
    activeProjects: number;
    completedTasks: number;
    nearDeadline: number;
  };
  onCreateProject: () => void;
}

export default function StatsCards({ stats, onCreateProject }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Stats Card */}
      <div className="glass-card p-6 hover:scale-[1.02] transition-transform">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Total Projects</h3>
          <span className="text-2xl">📊</span>
        </div>
        <p className="text-3xl font-bold text-gray-900">{stats.totalProjects}</p>
        <p className="text-xs text-gray-500 mt-1">All time</p>
      </div>

      {/* Active Projects */}
      <div className="glass-card p-6 hover:scale-[1.02] transition-transform">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Active Projects</h3>
          <span className="text-2xl">🎯</span>
        </div>
        <p className="text-3xl font-bold text-blue-600">{stats.activeProjects}</p>
        <p className="text-xs text-gray-500 mt-1">In progress</p>
      </div>

      {/* Completed Tasks */}
      <div className="glass-card p-6 hover:scale-[1.02] transition-transform">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">Tasks Done</h3>
          <span className="text-2xl">✅</span>
        </div>
        <p className="text-3xl font-bold text-green-600">{stats.completedTasks}</p>
        <p className="text-xs text-gray-500 mt-1">Total completed</p>
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-6 hover:scale-[1.02] transition-transform">
        <h3 className="text-sm font-medium text-gray-600 mb-4">🎯 Quick Actions</h3>
        <div className="space-y-2">
          <button
            onClick={onCreateProject}
            className="w-full btn-primary text-sm py-2"
          >
            + New Project
          </button>
          <button className="w-full btn-glass text-sm py-2">
            📥 Import
          </button>
          <button className="w-full btn-glass text-sm py-2">
            📚 Templates
          </button>
        </div>
      </div>
    </div>
  );
}

