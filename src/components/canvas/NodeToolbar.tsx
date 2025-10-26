// Node Toolbar Component - Manual Node Creation
'use client';

import { useState } from 'react';
import { Calendar, FileText, CheckSquare, Bot, Loader2 } from "lucide-react";

interface NodeToolbarProps {
  onStartDragNode: (type: 'phase' | 'step' | 'substep') => void;
  onCancelDragNode: () => void;
  dragNodeType: 'phase' | 'step' | 'substep' | null;
  isAddingNode: boolean;
  onGenerateAI?: () => void;
  isGenerating?: boolean;
}

export default function NodeToolbar({ 
  onStartDragNode, 
  onCancelDragNode, 
  dragNodeType,
  isAddingNode, 
  onGenerateAI, 
  isGenerating 
}: NodeToolbarProps) {
  
  const handleToolClick = (type: 'phase' | 'step' | 'substep') => {
    onStartDragNode(type);
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      <div className="glass-panel rounded-2xl px-6 py-4 shadow-glass-lg">
        <div className="flex items-center space-x-3">
          {/* Add Phase */}
          <button
            onClick={() => handleToolClick('phase')}
            disabled={dragNodeType !== null && dragNodeType !== 'phase'}
            className={`flex flex-col items-center space-y-1 px-6 py-3 rounded-xl transition-all group hover:scale-105 ${
              dragNodeType === 'phase'
                ? 'bg-blue-500 text-white shadow-lg scale-105 ring-4 ring-blue-300'
                : 'bg-white hover:bg-blue-50 text-gray-700 dark:text-gray-900 border-2 border-blue-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Calendar className="w-8 h-8" />
            <span className="text-xs font-semibold">{dragNodeType === 'phase' ? 'Click to Place' : 'Phase'}</span>
          </button>

          {/* Add Step */}
          <button
            onClick={() => handleToolClick('step')}
            disabled={dragNodeType !== null && dragNodeType !== 'step'}
            className={`flex flex-col items-center space-y-1 px-6 py-3 rounded-xl transition-all group hover:scale-105 ${
              dragNodeType === 'step'
                ? 'bg-purple-500 text-white shadow-lg scale-105 ring-4 ring-purple-300'
                : 'bg-white hover:bg-purple-50 text-gray-700 dark:text-gray-900 border-2 border-purple-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <FileText className="w-8 h-8" />
            <span className="text-xs font-semibold">{dragNodeType === 'step' ? 'Click to Place' : 'Step'}</span>
          </button>

          {/* Add Substep */}
          <button
            onClick={() => handleToolClick('substep')}
            disabled={dragNodeType !== null && dragNodeType !== 'substep'}
            className={`flex flex-col items-center space-y-1 px-6 py-3 rounded-xl transition-all group hover:scale-105 ${
              dragNodeType === 'substep'
                ? 'bg-pink-500 text-white shadow-lg scale-105 ring-4 ring-pink-300'
                : 'bg-white hover:bg-pink-50 text-gray-700 dark:text-gray-900 border-2 border-pink-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <CheckSquare className="w-8 h-8" />
            <span className="text-xs font-semibold">{dragNodeType === 'substep' ? 'Click to Place' : 'Substep'}</span>
          </button>

          {/* Cancel Button (show when dragging) */}
          {dragNodeType && (
            <>
              <div className="w-px h-12 bg-gray-300 mx-2"></div>
              <button
                onClick={onCancelDragNode}
                className="flex flex-col items-center space-y-1 px-6 py-3 rounded-xl transition-all bg-red-500 hover:bg-red-600 text-white shadow-lg"
              >
                <span className="text-2xl">✕</span>
                <span className="text-xs font-semibold">Cancel</span>
              </button>
            </>
          )}

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
              {isGenerating ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <Bot className="w-8 h-8" />
              )}
              <span className="text-xs font-semibold">
                {isGenerating ? 'Generating...' : 'AI Generate'}
              </span>
            </button>
          )}

          {/* Info */}
          {!dragNodeType && (
            <div className="ml-4 text-xs text-gray-600 dark:text-gray-400 max-w-xs">
              <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">💡 Quick Tips:</div>
              <div>• Click node type, then click canvas to place</div>
              <div>• Drag from node handle to connect</div>
              <div>• Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">ESC</kbd> to cancel</div>
            </div>
          )}
          {dragNodeType && (
            <div className="ml-4 text-xs text-white bg-blue-600 dark:bg-blue-500 px-4 py-2 rounded-lg max-w-xs animate-pulse">
              <div className="font-semibold mb-1">🎯 Placing Mode Active</div>
              <div>Click anywhere on canvas to place node</div>
              <div className="mt-1">Press ESC or click Cancel to stop</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

