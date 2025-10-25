// Project List Component
'use client';

import { Project } from '@/lib/supabase';
import { formatDistanceToNow } from '@/core/shared/utils';

interface ProjectListProps {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

export default function ProjectList({ projects, onOpenProject, onDeleteProject }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No projects yet</h3>
        <p className="text-gray-600 mb-6">Create your first thesis roadmap!</p>
        <button className="btn-primary">
          + Create Your First Project
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => {
        const metadata = project.metadata as any;
        const progress = metadata?.progressPercentage || 0;
        const completedSteps = metadata?.completedSteps || 0;
        const totalSteps = metadata?.totalSteps || 0;

        return (
          <div
            key={project.id}
            className="glass-card p-6 hover:scale-[1.01] transition-all cursor-pointer group"
            onClick={() => onOpenProject(project.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Project Title & Info */}
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">📘</span>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {project.title}
                  </h3>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center space-x-1">
                    <span>🎓</span>
                    <span>{project.jurusan}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>⏰</span>
                    <span>{project.timeline}</span>
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">
                      {completedSteps}/{totalSteps} steps • {progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Description */}
                {project.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {project.description}
                  </p>
                )}

                {/* Last Edited */}
                <p className="text-xs text-gray-500">
                  Last edited: {formatDistanceToNow(new Date(project.last_accessed_at))}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenProject(project.id);
                  }}
                  className="btn-primary text-sm px-4 py-2"
                >
                  Open
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Export functionality
                  }}
                  className="btn-glass text-sm px-4 py-2"
                >
                  Export
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProject(project.id);
                  }}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                  title="Delete project"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

