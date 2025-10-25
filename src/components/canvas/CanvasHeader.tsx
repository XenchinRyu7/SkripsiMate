// Canvas Header Component
'use client';

import { Project } from '@/lib/supabase';
import { useState } from 'react';

interface CanvasHeaderProps {
  project: Project;
  onBack: () => void;
  onToggleChat: () => void;
  chatOpen: boolean;
  onSave?: () => void;
  saving?: boolean;
  onExport?: () => void;
  onSettings?: () => void;
}

export default function CanvasHeader({ project, onBack, onToggleChat, chatOpen, onSave, saving, onExport, onSettings }: CanvasHeaderProps) {
  const metadata = project.metadata as any;
  const progress = metadata?.progressPercentage || 0;

  return (
    <header className="glass-panel border-b border-white/20 flex-shrink-0">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-white/50 transition-colors"
            title="Back to Dashboard"
          >
            ← Back
          </button>

          <div className="border-l border-gray-300 pl-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl">📂</span>
              <div>
                <h1 className="font-bold text-gray-900 text-sm">
                  {project.title}
                </h1>
                <p className="text-xs text-gray-600">
                  {project.jurusan} • {project.timeline}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Center Section - Progress */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Progress:</span>
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-900">{progress}%</span>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleChat}
            className={`px-4 py-2 rounded-lg transition-all ${
              chatOpen
                ? 'bg-blue-500 text-white'
                : 'bg-white/50 hover:bg-white/70 text-gray-700'
            }`}
            title={chatOpen ? 'Close AI Chat' : 'Open AI Chat'}
          >
            🤖 AI Agents
          </button>

          <button
            onClick={onExport}
            className="px-4 py-2 rounded-lg bg-white/50 hover:bg-white/70 text-gray-700 transition-colors"
            title="Export Project"
          >
            📥 Export
          </button>

          <button
            onClick={onSettings}
            className="px-4 py-2 rounded-lg bg-white/50 hover:bg-white/70 text-gray-700 transition-colors"
            title="Settings"
          >
            ⚙️
          </button>

          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            title="Save Project"
          >
            {saving ? (
              <>
                <span className="inline-block animate-spin">⏳</span>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

