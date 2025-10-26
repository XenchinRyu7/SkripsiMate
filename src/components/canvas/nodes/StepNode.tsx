// Step/Substep/Checklist Node Component
'use client';

import { memo, FC } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Node as DBNode } from '@/lib/supabase';

const StepNode: FC<NodeProps<any>> = ({ data }) => {
  const metadata = (data as any).metadata || {};
  const isSmall = (data as any).type === 'substep' || (data as any).type === 'checklist';

  return (
    <div className={`glass-card rounded-xl p-4 ${
      isSmall ? 'min-w-[250px]' : 'min-w-[300px]'
    } shadow-glass hover:scale-[1.02] transition-transform cursor-pointer`}>
      {/* Handle from phase/parent (top) */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="step-top"
        className={`!w-3 !h-3 ${isSmall ? '!bg-pink-500' : '!bg-purple-500'}`}
      />

      {/* Handle to substeps (bottom - for steps only) */}
      {!isSmall && (
        <Handle 
          type="source" 
          position={Position.Bottom} 
          id="step-bottom"
          className="!bg-purple-500 !w-3 !h-3"
        />
      )}

      {/* Node Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start space-x-2 flex-1">
          <span className="text-lg flex-shrink-0">
            {data.status === 'completed' ? '✅' :
             data.status === 'in_progress' ? '🔄' :
             data.status === 'blocked' ? '🚫' : '⬜'}
          </span>
          <div className="flex-1">
            <h4 className={`font-semibold text-gray-900 dark:text-gray-100 ${
              isSmall ? 'text-sm' : 'text-base'
            }`}>
              {data.title}
            </h4>
            {data.description && !isSmall && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {data.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-400">
        {metadata?.estimatedTime && (
          <span className="flex items-center space-x-1">
            <span>⏱️</span>
            <span>{metadata.estimatedTime}</span>
          </span>
        )}
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          data.priority === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
          data.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
          data.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
          'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
        }`}>
          {data.priority}
        </span>
      </div>

      {/* Dependencies indicator */}
      {metadata?.dependencies && metadata.dependencies.length > 0 && (
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          🔗 {metadata.dependencies.length} dependencies
        </div>
      )}
    </div>
  );
};

export default memo(StepNode);

