// Canvas Header Component
'use client';

import { Project } from '@/lib/supabase';
import { FolderOpen, Bot, Users, Download, Settings, Save, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from '@/components/ui/Toast';
import { clientLogger } from '@/lib/logger';

interface CanvasHeaderProps {
  project: Project;
  onBack: () => void;
  onToggleChat: () => void;
  chatOpen: boolean;
  onSave?: () => void;
  saving?: boolean;
  onExport?: () => void;
  onSettings?: () => void;
  onShare?: () => void;
}

export default function CanvasHeader({ project, onBack, onToggleChat, chatOpen, onSave, saving, onExport, onSettings, onShare }: CanvasHeaderProps) {
  const toast = useToast();
  const metadata = project.metadata as any;
  const progress = metadata?.progressPercentage || 0;

  return (
    <header className="glass-panel border-b border-white/20 flex-shrink-0">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-white/50 transition-colors flex items-center space-x-2"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="border-l border-gray-300 pl-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FolderOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                  {project.title}
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {project.jurusan} • {project.timeline}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Center Section - Progress */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">Progress:</span>
          <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{progress}%</span>
          
          {/* Debug Button */}
          <button
            onClick={() => {
              toast.info('Fetching database state...');
              fetch(`/api/projects/${project.id}/debug`)
                .then(r => r.json())
                .then(data => {
                  if (data.incompleteNodes.length > 0) {
                    console.table(data.incompleteNodes);
                    toast.warning(`Found ${data.incompleteNodes.length} incomplete node(s). Check console for details!`);
                  } else {
                    toast.success('All nodes completed!');
                  }
                  
                  if (data.summary.totalNodes !== metadata?.totalSteps) {
                    toast.error(`Sync issue! UI shows ${metadata?.totalSteps} nodes but DB has ${data.summary.totalNodes}. Click 🔄 to fix!`);
                  } else {
                    toast.success(`DB state: ${data.summary.progressPercentage}% (${data.summary.totalNodes} nodes)`);
                  }
                  
                })
                .catch(err => {
                  toast.error('Failed to fetch debug data');
                });
            }}
            className="px-2 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-800 text-yellow-800 dark:text-yellow-100 rounded font-semibold transition-colors"
            title="Debug: Show real database state (check console)"
          >
            🔍
          </button>
          
          {/* Force Sync Button */}
          <button
            onClick={() => {
              toast.info('Syncing progress from database...');
              fetch(`/api/projects/${project.id}/recalculate`, { method: 'POST' })
                .then(r => r.json())
                .then(data => {
                  toast.success(`Progress synced! ${data.summary.progressPercentage}% (${data.summary.totalNodes} nodes)`);
                  
                  // Reload after short delay
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                })
                .catch(err => {
                  toast.error('Failed to sync progress');
                });
            }}
            className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-100 rounded font-semibold transition-colors"
            title="Force sync progress from database"
          >
            🔄
          </button>
          
          {/* Cleanup Orphaned Nodes Button */}
          <button
            onClick={() => {
              toast.info('Cleaning up orphaned nodes...');
              fetch(`/api/projects/${project.id}/cleanup`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}) 
              })
                .then(r => r.json())
                .then(data => {
                  if (data.summary.deletedCount > 0) {
                    toast.success(`Cleaned up ${data.summary.deletedCount} orphaned node(s)!`);
                  } else {
                    toast.success('No orphaned nodes found. Database is clean!');
                  }
                  
                  // Reload after short delay
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                })
                .catch(err => {
                  toast.error('Failed to cleanup nodes');
                });
            }}
            className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-800 dark:text-red-100 rounded font-semibold transition-colors"
            title="Clean up orphaned/ghost nodes"
          >
            🧹
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleChat}
            className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
              chatOpen
                ? 'bg-blue-500 text-white'
                : 'bg-white/50 hover:bg-white/70 text-gray-700'
            }`}
            title={chatOpen ? 'Close AI Chat' : 'Open AI Chat'}
          >
            <Bot className="w-4 h-4" />
            <span>AI Agents</span>
          </button>

          <button
            onClick={onShare}
            className="px-4 py-2 rounded-lg bg-white/50 hover:bg-white/70 text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-2"
            title="Invite Team Members"
          >
            <Users className="w-4 h-4" />
            <span>Share</span>
          </button>

          <button
            onClick={onExport}
            className="px-4 py-2 rounded-lg bg-white/50 hover:bg-white/70 text-gray-700 transition-colors flex items-center space-x-2"
            title="Export Project"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          <button
            onClick={onSettings}
            className="p-2 rounded-lg bg-white/50 hover:bg-white/70 text-gray-700 transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            title="Save Project"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

