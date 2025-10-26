// Project List Component
'use client';

import { Project } from '@/lib/supabase';
import { formatDistanceToNow } from '@/core/shared/utils';
import { FolderOpen, Trash2, Download, Clock, Info, BookOpen, GraduationCap, Calendar } from "lucide-react";

interface ProjectListProps {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onCreateProject?: () => void;
  onShowDetail?: (project: Project) => void;
  onExportProject?: (project: Project) => void;
}

export default function ProjectList({ projects, onOpenProject, onDeleteProject, onCreateProject, onShowDetail, onExportProject }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mb-4 inline-flex p-6 bg-blue-100 rounded-full">
          <BookOpen className="w-16 h-16 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No projects yet</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first thesis roadmap!</p>
        <button 
          onClick={onCreateProject}
          className="btn-primary px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:shadow-lg transition-all"
        >
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
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                    {project.title}
                  </h3>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <span className="flex items-center space-x-1">
                    <GraduationCap className="w-4 h-4" />
                    <span>{project.jurusan}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{project.timeline}</span>
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
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
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {project.description}
                  </p>
                )}

                {/* Last Edited */}
                <p className="text-xs text-gray-500 flex items-center space-x-1">
                  <Clock size={12} />
                  <span>Last edited: {formatDistanceToNow(new Date(project.last_accessed_at))}</span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenProject(project.id);
                  }}
                  className="btn-primary text-sm px-4 py-2 flex items-center space-x-2"
                  title="Open project"
                >
                  <FolderOpen size={16} />
                  <span>Open</span>
                </button>
                {onShowDetail && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowDetail(project);
                    }}
                    className="bg-white border-2 border-blue-200 text-blue-700 font-medium text-sm px-4 py-2 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center space-x-2"
                    title="View project details"
                  >
                    <Info size={16} />
                    <span>Info</span>
                  </button>
                )}
                {onExportProject && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExportProject(project);
                    }}
                    className="bg-white border-2 border-green-200 text-green-700 font-medium text-sm px-4 py-2 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all flex items-center space-x-2"
                    title="Export project"
                  >
                    <Download size={16} />
                    <span>Export</span>
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProject(project.id);
                  }}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors border-2 border-transparent hover:border-red-200"
                  title="Delete project"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

