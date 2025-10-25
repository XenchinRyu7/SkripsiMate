// Node Detail Panel Component
'use client';

import { useState, useEffect } from 'react';
import { Node as DBNode } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

interface NodeDetailPanelProps {
  node: DBNode;
  allNodes: DBNode[];
  onClose: () => void;
  onUpdate: (updatedNodes: DBNode[]) => void;
}

export default function NodeDetailPanel({ node, allNodes, onClose, onUpdate }: NodeDetailPanelProps) {
  const [status, setStatus] = useState(node.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const metadata = (node.metadata as any) || {};

  // Get child nodes
  const childNodes = allNodes.filter(n => n.parent_id === node.id);
  const hasChildren = childNodes.length > 0;

  // Calculate progress for parent nodes
  const calculateProgress = () => {
    if (childNodes.length === 0) {
      return node.status === 'completed' ? 100 : 0;
    }
    
    const completedChildren = childNodes.filter(n => n.status === 'completed').length;
    return Math.round((completedChildren / childNodes.length) * 100);
  };

  const progress = calculateProgress();

  // Toggle substep completion
  const toggleSubstepStatus = async (substepId: string) => {
    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/nodes/${substepId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: allNodes.find(n => n.id === substepId)?.status === 'completed' ? 'pending' : 'completed' 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const { nodes: updatedNodes } = await response.json();
      onUpdate(updatedNodes);
      
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Manual status change (for steps and phases if needed)
  const changeStatus = async (newStatus: 'pending' | 'in_progress' | 'completed' | 'blocked') => {
    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/nodes/${node.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const { nodes: updatedNodes } = await response.json();
      onUpdate(updatedNodes);
      setStatus(newStatus);
      
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Get status color
  const getStatusColor = (nodeStatus: string) => {
    switch (nodeStatus) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'blocked': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Get status icon
  const getStatusIcon = (nodeStatus: string) => {
    switch (nodeStatus) {
      case 'completed': return '✅';
      case 'in_progress': return '🔄';
      case 'blocked': return '🚫';
      default: return '⬜';
    }
  };

  // Get type icon
  const getTypeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'phase': return '📅';
      case 'step': return '📝';
      case 'substep': return '✓';
      default: return '📌';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="glass-panel rounded-2xl p-6 max-w-2xl w-full shadow-glass-lg animate-slide-in-bottom max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-3 flex-1">
            <span className="text-3xl">{getTypeIcon(node.type)}</span>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                  node.type === 'phase' ? 'bg-blue-100 text-blue-700' :
                  node.type === 'step' ? 'bg-purple-100 text-purple-700' :
                  'bg-pink-100 text-pink-700'
                }`}>
                  {node.type}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(status)}`}>
                  {getStatusIcon(status)} {status.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {node.title}
              </h2>
              {node.description && (
                <p className="text-gray-600 text-sm">
                  {node.description}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl ml-4"
          >
            ×
          </button>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {metadata.estimatedTime && (
            <div className="glass-card p-3">
              <div className="text-xs text-gray-600 mb-1">Estimated Time</div>
              <div className="font-semibold text-gray-900">⏰ {metadata.estimatedTime}</div>
            </div>
          )}
          {node.priority && (
            <div className="glass-card p-3">
              <div className="text-xs text-gray-600 mb-1">Priority</div>
              <div className={`font-semibold capitalize ${
                node.priority === 'critical' ? 'text-red-600' :
                node.priority === 'high' ? 'text-orange-600' :
                node.priority === 'medium' ? 'text-yellow-600' :
                'text-gray-600'
              }`}>
                🎯 {node.priority}
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar (for parent nodes) */}
        {hasChildren && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-bold text-gray-900">{progress}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {childNodes.filter(n => n.status === 'completed').length} of {childNodes.length} completed
            </p>
          </div>
        )}

        {/* Child Nodes (Substeps/Steps) */}
        {hasChildren && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              {node.type === 'phase' ? '📝 Steps' : '✓ Substeps'} ({childNodes.length})
            </h3>
            <div className="space-y-2">
              {childNodes.map((child) => (
                <div
                  key={child.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                    child.status === 'completed'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <button
                    onClick={() => toggleSubstepStatus(child.id)}
                    disabled={isUpdating}
                    className="flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all disabled:opacity-50"
                    style={{
                      borderColor: child.status === 'completed' ? '#10b981' : '#d1d5db',
                      backgroundColor: child.status === 'completed' ? '#10b981' : 'white',
                    }}
                  >
                    {child.status === 'completed' && (
                      <span className="text-white text-sm">✓</span>
                    )}
                  </button>
                  <div className="flex-1">
                    <div className={`font-medium ${
                      child.status === 'completed' ? 'text-green-900 line-through' : 'text-gray-900'
                    }`}>
                      {child.title}
                    </div>
                    {child.description && (
                      <div className="text-xs text-gray-600 mt-1">{child.description}</div>
                    )}
                  </div>
                  <span className="text-2xl">
                    {getStatusIcon(child.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Actions (for manual override if needed) */}
        {!hasChildren && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Change Status</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => changeStatus('pending')}
                disabled={isUpdating || status === 'pending'}
                className="px-4 py-2 rounded-lg border-2 border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                ⬜ Pending
              </button>
              <button
                onClick={() => changeStatus('in_progress')}
                disabled={isUpdating || status === 'in_progress'}
                className="px-4 py-2 rounded-lg border-2 border-blue-300 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                🔄 In Progress
              </button>
              <button
                onClick={() => changeStatus('completed')}
                disabled={isUpdating || status === 'completed'}
                className="px-4 py-2 rounded-lg border-2 border-green-300 hover:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                ✅ Completed
              </button>
              <button
                onClick={() => changeStatus('blocked')}
                disabled={isUpdating || status === 'blocked'}
                className="px-4 py-2 rounded-lg border-2 border-red-300 hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                🚫 Blocked
              </button>
            </div>
          </div>
        )}

        {/* Info Note */}
        {hasChildren && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> {node.type === 'phase' ? 'This phase' : 'This step'} will automatically be marked as completed when all {node.type === 'phase' ? 'steps' : 'substeps'} are done.
            </p>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

