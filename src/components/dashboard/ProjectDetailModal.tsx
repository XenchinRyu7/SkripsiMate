// Project Detail Modal
'use client';

import { Project } from '@/lib/supabase';
import { formatDistanceToNow } from '@/core/shared/utils';
import { X, Calendar, GraduationCap, CalendarPlus, History, TrendingUp, CheckCircle2, BarChart3, FileText } from "lucide-react";

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  const metadata = project.metadata as any;
  const progress = metadata?.progressPercentage || 0;
  const completedSteps = metadata?.completedSteps || 0;
  const totalSteps = metadata?.totalSteps || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 glass-panel border-b border-white/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100">Project Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Project Title */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{project.title}</h3>
            {project.description && (
              <p className="text-gray-600 dark:text-gray-400">{project.description}</p>
            )}
          </div>

          {/* Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{project.jurusan}</p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Timeline</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{project.timeline}</p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CalendarPlus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatDistanceToNow(new Date(project.created_at))}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <History className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatDistanceToNow(new Date(project.last_accessed_at))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="glass-panel p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Progress</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{progress}%</p>
              </div>
            </div>

            <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{completedSteps}</span> of{' '}
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{totalSteps}</span> steps completed
                </span>
              </div>
            </div>
          </div>

          {/* Project Metadata */}
          {metadata && (
            <div className="glass-panel p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Project Statistics</span>
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Total Phases</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{metadata.totalPhases || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500">Completed Phases</p>
                  <p className="font-semibold text-green-600">{metadata.completedPhases || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Steps</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{totalSteps}</p>
                </div>
                <div>
                  <p className="text-gray-500">Completed Steps</p>
                  <p className="font-semibold text-green-600">{completedSteps}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 glass-panel border-t border-white/20 px-6 py-4">
          <button
            onClick={onClose}
            className="btn-primary w-full py-2.5"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

