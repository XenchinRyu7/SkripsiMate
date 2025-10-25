// Phase Node Component (Container)
'use client';

import { memo, FC } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Node as DBNode } from '@/lib/supabase';

const PhaseNode: FC<NodeProps<any>> = ({ data }) => {
  const metadata = (data as any).metadata || {};
  const progress = metadata.progress || 0;

  return (
    <div className="glass-card rounded-2xl p-6 min-w-[350px] border-2 border-blue-400/50 shadow-glass-lg">
      {/* Handles for phase progression (horizontal) */}
      <Handle 
        type="target" 
        position={Position.Left} 
        id="phase-left"
        className="!bg-green-500 !w-3 !h-3"
        style={{ top: '50%' }}
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="phase-right"
        className="!bg-green-500 !w-3 !h-3"
        style={{ top: '50%' }}
      />
      
      {/* Handle for steps (vertical) */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="phase-steps"
        className="!bg-blue-500 !w-3 !h-3"
      />

      {/* Phase Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">📅</span>
          <h3 className="font-bold text-gray-900 text-lg">{data.title}</h3>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          data.status === 'completed' ? 'bg-green-100 text-green-700' :
          data.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {data.status}
        </span>
      </div>

      {/* Description */}
      {data.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {data.description}
        </p>
      )}

      {/* Metadata */}
      <div className="flex items-center space-x-4 text-xs text-gray-600 mb-3">
        <span className="flex items-center space-x-1">
          <span>⏰</span>
          <span>{metadata?.estimatedTime || 'TBD'}</span>
        </span>
        <span className="flex items-center space-x-1">
          <span>🎯</span>
          <span className="capitalize">{data.priority}</span>
        </span>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(PhaseNode);

