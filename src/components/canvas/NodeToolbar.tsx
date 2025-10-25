// Node Toolbar Component - Manual Node Creation
'use client';

import { useState } from 'react';

interface NodeToolbarProps {
  onAddNode: (type: 'phase' | 'step' | 'substep') => void;
  isEdgeMode: boolean;
  onToggleEdgeMode: () => void;
  isAddingNode: boolean;
  onGenerateAI?: () => void;
  isGenerating?: boolean;
}

export default function NodeToolbar({ onAddNode, isEdgeMode, onToggleEdgeMode, isAddingNode, onGenerateAI, isGenerating }: NodeToolbarProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const handleToolClick = (type: 'phase' | 'step' | 'substep') => {
    setSelectedTool(type);
    onAddNode(type);
    // Reset after a short delay
    setTimeout(() => setSelectedTool(null), 300);
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      <div className="glass-panel rounded-2xl px-6 py-4 shadow-glass-lg">
        <div className="flex items-center space-x-3">
          {/* Add Phase */}
          <button
            onClick={() => handleToolClick('phase')}
            disabled={isAddingNode}
            className={`flex flex-col items-center space-y-1 px-6 py-3 rounded-xl transition-all group hover:scale-105 ${
              selectedTool === 'phase'
                ? 'bg-blue-500 text-white shadow-lg scale-105'
                : 'bg-white hover:bg-blue-50 text-gray-700 border-2 border-blue-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="text-3xl">📅</div>
            <span className="text-xs font-semibold">Phase</span>
          </button>

          {/* Add Step */}
          <button
            onClick={() => handleToolClick('step')}
            disabled={isAddingNode}
            className={`flex flex-col items-center space-y-1 px-6 py-3 rounded-xl transition-all group hover:scale-105 ${
              selectedTool === 'step'
                ? 'bg-purple-500 text-white shadow-lg scale-105'
                : 'bg-white hover:bg-purple-50 text-gray-700 border-2 border-purple-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="text-3xl">📝</div>
            <span className="text-xs font-semibold">Step</span>
          </button>

          {/* Add Substep */}
          <button
            onClick={() => handleToolClick('substep')}
            disabled={isAddingNode}
            className={`flex flex-col items-center space-y-1 px-6 py-3 rounded-xl transition-all group hover:scale-105 ${
              selectedTool === 'substep'
                ? 'bg-pink-500 text-white shadow-lg scale-105'
                : 'bg-white hover:bg-pink-50 text-gray-700 border-2 border-pink-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="text-3xl">✓</div>
            <span className="text-xs font-semibold">Substep</span>
          </button>

          {/* Divider */}
          <div className="w-px h-12 bg-gray-300 mx-2"></div>

          {/* Edge Mode Toggle */}
          <button
            onClick={onToggleEdgeMode}
            className={`flex flex-col items-center space-y-1 px-6 py-3 rounded-xl transition-all group hover:scale-105 ${
              isEdgeMode
                ? 'bg-green-500 text-white shadow-lg scale-105'
                : 'bg-white hover:bg-green-50 text-gray-700 border-2 border-green-200'
            }`}
          >
            <div className="text-3xl">🔗</div>
            <span className="text-xs font-semibold">
              {isEdgeMode ? 'Connecting' : 'Connect'}
            </span>
          </button>

          {/* Divider */}
          <div className="w-px h-12 bg-gray-300 mx-2"></div>

          {/* Generate AI Button */}
          {onGenerateAI && (
            <button
              onClick={onGenerateAI}
              disabled={isGenerating}
              className={`flex flex-col items-center space-y-1 px-6 py-3 rounded-xl transition-all group hover:scale-105 ${
                isGenerating
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-2 border-purple-300 shadow-lg'
              } disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              <div className="text-3xl">{isGenerating ? '⏳' : '🤖'}</div>
              <span className="text-xs font-semibold">
                {isGenerating ? 'Generating...' : 'AI Generate'}
              </span>
            </button>
          )}

          {/* Info */}
          <div className="ml-4 text-xs text-gray-600 max-w-xs">
            <div className="font-semibold mb-1">Quick Add:</div>
            <div>Click card to add to canvas center</div>
            <div>Click 🔗 then drag between nodes to connect</div>
          </div>
        </div>
      </div>
    </div>
  );
}

