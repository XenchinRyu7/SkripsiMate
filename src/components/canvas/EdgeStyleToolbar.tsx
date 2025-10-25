// Edge Style Toolbar Component - Figma/Jam style
'use client';

import { useState } from 'react';
import { Edge } from '@xyflow/react';

interface EdgeStyleToolbarProps {
  edge: Edge;
  position: { x: number; y: number };
  onUpdate: (edgeId: string, updates: any) => void;
  onDelete: (edgeId: string) => void;
  onClose: () => void;
}

export default function EdgeStyleToolbar({ edge, position, onUpdate, onDelete, onClose }: EdgeStyleToolbarProps) {
  const [lineType, setLineType] = useState(edge.type || 'smoothstep');
  const [startMarker, setStartMarker] = useState(
    typeof edge.markerStart === 'string' ? edge.markerStart : 
    typeof edge.markerStart === 'object' ? (edge.markerStart as any)?.type || 'none' : 
    'none'
  );
  const [endMarker, setEndMarker] = useState(
    typeof edge.markerEnd === 'string' ? edge.markerEnd : 
    typeof edge.markerEnd === 'object' ? (edge.markerEnd as any)?.type || 'arrow' : 
    'arrow'
  );

  const handleLineTypeChange = (type: string) => {
    setLineType(type);
    onUpdate(edge.id, { type });
  };

  const handleStartMarkerChange = (marker: string) => {
    setStartMarker(marker);
    const markerConfig = marker === 'none' ? undefined : { type: marker, color: 'currentColor' };
    onUpdate(edge.id, { markerStart: markerConfig });
  };

  const handleEndMarkerChange = (marker: string) => {
    setEndMarker(marker);
    const markerConfig = marker === 'none' ? undefined : { type: marker, color: 'currentColor' };
    onUpdate(edge.id, { markerEnd: markerConfig });
  };

  const handleDelete = () => {
    onDelete(edge.id);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Toolbar */}
      <div
        className="fixed z-50 glass-panel rounded-xl shadow-glass-lg p-3 animate-slide-in-bottom"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -100%) translateY(-10px)',
        }}
      >
        <div className="flex items-center space-x-3">
          {/* Line Type */}
          <div className="flex flex-col space-y-1">
            <span className="text-xs font-semibold text-gray-600">Line Type</span>
            <div className="flex space-x-1">
              <button
                onClick={() => handleLineTypeChange('default')}
                className={`p-2 rounded transition-all ${
                  lineType === 'default'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
                title="Straight"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="20" x2="20" y2="4" />
                </svg>
              </button>
              <button
                onClick={() => handleLineTypeChange('smoothstep')}
                className={`p-2 rounded transition-all ${
                  lineType === 'smoothstep'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
                title="Curved"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M 4,20 C 8,20 8,4 12,4 C 16,4 16,20 20,4" />
                </svg>
              </button>
              <button
                onClick={() => handleLineTypeChange('step')}
                className={`p-2 rounded transition-all ${
                  lineType === 'step'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
                title="Elbowed"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M 4,20 L 4,12 L 20,12 L 20,4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-16 bg-gray-300" />

          {/* Start Marker */}
          <div className="flex flex-col space-y-1">
            <span className="text-xs font-semibold text-gray-600">Start Point</span>
            <div className="flex space-x-1">
              <button
                onClick={() => handleStartMarkerChange('none')}
                className={`p-2 rounded transition-all ${
                  startMarker === 'none'
                    ? 'bg-purple-500 text-white'
                    : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
                title="None"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="12" x2="20" y2="12" />
                </svg>
              </button>
              <button
                onClick={() => handleStartMarkerChange('arrow')}
                className={`p-2 rounded transition-all ${
                  startMarker === 'arrow'
                    ? 'bg-purple-500 text-white'
                    : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
                title="Arrow"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="12" x2="20" y2="12" />
                  <polyline points="12,8 8,12 12,16" />
                </svg>
              </button>
              <button
                onClick={() => handleStartMarkerChange('dot')}
                className={`p-2 rounded transition-all ${
                  startMarker === 'dot'
                    ? 'bg-purple-500 text-white'
                    : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
                title="Dot"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="12" x2="20" y2="12" />
                  <circle cx="8" cy="12" r="3" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-16 bg-gray-300" />

          {/* End Marker */}
          <div className="flex flex-col space-y-1">
            <span className="text-xs font-semibold text-gray-600">End Point</span>
            <div className="flex space-x-1">
              <button
                onClick={() => handleEndMarkerChange('none')}
                className={`p-2 rounded transition-all ${
                  endMarker === 'none'
                    ? 'bg-green-500 text-white'
                    : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
                title="None"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="12" x2="20" y2="12" />
                </svg>
              </button>
              <button
                onClick={() => handleEndMarkerChange('arrow')}
                className={`p-2 rounded transition-all ${
                  endMarker === 'arrow'
                    ? 'bg-green-500 text-white'
                    : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
                title="Arrow"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="12" x2="16" y2="12" />
                  <polyline points="12,8 16,12 12,16" />
                </svg>
              </button>
              <button
                onClick={() => handleEndMarkerChange('dot')}
                className={`p-2 rounded transition-all ${
                  endMarker === 'dot'
                    ? 'bg-green-500 text-white'
                    : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
                title="Dot"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="12" x2="16" y2="12" />
                  <circle cx="16" cy="12" r="3" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-16 bg-gray-300" />

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all group"
            title="Delete Connection"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-1">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <span className="text-xs font-semibold">Delete</span>
          </button>
        </div>

        {/* Arrow indicator pointing to edge */}
        <div 
          className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full"
          style={{ width: 0, height: 0 }}
        >
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white/70" 
            style={{ filter: 'blur(2px)' }}
          />
        </div>
      </div>
    </>
  );
}

