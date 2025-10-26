// Node Detail Panel Component
'use client';

import { useState, useEffect } from 'react';
import { Node as DBNode } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { CheckCircle2, RefreshCw, XCircle, Square, Calendar, FileText, CheckSquare, Pin, Edit2, X, Clock, Target, Lightbulb } from "lucide-react";

interface NodeDetailPanelProps {
  node: DBNode;
  allNodes: DBNode[];
  onClose: () => void;
  onUpdate: (updatedNodes: DBNode[]) => void;
}

export default function NodeDetailPanel({ node, allNodes, onClose, onUpdate }: NodeDetailPanelProps) {
  const toast = useToast();
  const [status, setStatus] = useState(node.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNode, setEditedNode] = useState({
    title: node.title,
    description: node.description || '',
    priority: node.priority,
    estimatedTime: ((node.metadata as any) || {}).estimatedTime || '',
  });
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
      toast.success('Status updated successfully!');
      
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Save edited node
  const handleSaveEdit = async () => {
    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/nodes/${node.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editedNode.title,
          description: editedNode.description,
          priority: editedNode.priority,
          metadata: {
            ...metadata,
            estimatedTime: editedNode.estimatedTime,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update node');
      }

      const { nodes: updatedNodes } = await response.json();
      onUpdate(updatedNodes);
      setIsEditing(false);
      toast.success('Node updated successfully!');
      
    } catch (error) {
      console.error('Error updating node:', error);
      toast.error('Failed to update node. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditedNode({
      title: node.title,
      description: node.description || '',
      priority: node.priority,
      estimatedTime: metadata.estimatedTime || '',
    });
    setIsEditing(false);
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
      toast.success('✅ Status changed successfully!');
      
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status. Please try again.');
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
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'in_progress': return <RefreshCw className="w-5 h-5 text-blue-600" />;
      case 'blocked': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Square className="w-5 h-5 text-gray-600" />;
    }
  };

  // Get type icon
  const getTypeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'phase': return <Calendar className="w-8 h-8 text-blue-600" />;
      case 'step': return <FileText className="w-8 h-8 text-purple-600" />;
      case 'substep': return <CheckSquare className="w-8 h-8 text-pink-600" />;
      default: return <Pin className="w-8 h-8 text-gray-600" />;
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
            <div className="flex-shrink-0">{getTypeIcon(node.type)}</div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                  node.type === 'phase' ? 'bg-blue-100 text-blue-700' :
                  node.type === 'step' ? 'bg-purple-100 text-purple-700' :
                  'bg-pink-100 text-pink-700'
                }`}>
                  {node.type}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(status)} flex items-center space-x-1`}>
                  {getStatusIcon(status)}
                  <span>{status.replace('_', ' ')}</span>
                </span>
              </div>
              
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editedNode.title}
                    onChange={(e) => setEditedNode({ ...editedNode, title: e.target.value })}
                    className="w-full text-2xl font-bold text-gray-900 dark:text-gray-100 dark:bg-gray-800 border-b-2 border-blue-500 focus:outline-none"
                    placeholder="Node title"
                  />
                  <textarea
                    value={editedNode.description}
                    onChange={(e) => setEditedNode({ ...editedNode, description: e.target.value })}
                    className="w-full text-sm text-gray-600 dark:text-gray-300 dark:bg-gray-800 border rounded-lg p-2 focus:outline-none focus:border-blue-500"
                    placeholder="Description"
                    rows={3}
                  />
                  <div className="flex space-x-4">
                    <button
                      onClick={handleSaveEdit}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                      {isUpdating ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {node.title}
                  </h2>
                  {node.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {node.description}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-500 hover:text-blue-700 p-2"
                title="Edit Node"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass-card p-3">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Estimated Time</div>
            {isEditing ? (
              <input
                type="text"
                value={editedNode.estimatedTime}
                onChange={(e) => setEditedNode({ ...editedNode, estimatedTime: e.target.value })}
                className="w-full font-semibold text-gray-900 dark:text-gray-100 dark:bg-gray-800 border-b border-blue-500 focus:outline-none"
                placeholder="e.g., 2 weeks, 1 month"
              />
            ) : (
              <div className="font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{metadata.estimatedTime || 'Not set'}</span>
              </div>
            )}
          </div>
          <div className="glass-card p-3">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Priority</div>
            {isEditing ? (
              <select
                value={editedNode.priority}
                onChange={(e) => setEditedNode({ ...editedNode, priority: e.target.value as any })}
                className="w-full font-semibold text-gray-900 dark:text-gray-100 dark:bg-gray-800 border-b border-blue-500 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            ) : (
              <div className={`font-semibold capitalize flex items-center space-x-2 ${
                node.priority === 'critical' ? 'text-red-600' :
                node.priority === 'high' ? 'text-orange-600' :
                node.priority === 'medium' ? 'text-yellow-600' :
                'text-gray-600'
              }`}>
                <Target className="w-4 h-4" />
                <span>{node.priority}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar (for parent nodes) */}
        {hasChildren && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{progress}%</span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {childNodes.filter(n => n.status === 'completed').length} of {childNodes.length} completed
            </p>
          </div>
        )}

        {/* Child Nodes (Substeps/Steps) */}
        {hasChildren && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center space-x-2">
              {node.type === 'phase' ? (
                <>
                  <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span>Steps ({childNodes.length})</span>
                </>
              ) : (
                <>
                  <CheckSquare className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  <span>Substeps ({childNodes.length})</span>
                </>
              )}
            </h3>
            <div className="space-y-2">
              {childNodes.map((child) => (
                <div
                  key={child.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                    child.status === 'completed'
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
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
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className={`font-medium ${
                      child.status === 'completed' 
                        ? 'text-green-900 dark:text-green-400 line-through' 
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {child.title}
                    </div>
                    {child.description && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{child.description}</div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusIcon(child.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Actions (for manual override if needed) */}
        {!hasChildren && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Change Status</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => changeStatus('pending')}
                disabled={isUpdating || status === 'pending'}
                className="px-4 py-2 rounded-lg border-2 border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
              >
                <Square className="w-4 h-4" />
                <span>Pending</span>
              </button>
              <button
                onClick={() => changeStatus('in_progress')}
                disabled={isUpdating || status === 'in_progress'}
                className="px-4 py-2 rounded-lg border-2 border-blue-300 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>In Progress</span>
              </button>
              <button
                onClick={() => changeStatus('completed')}
                disabled={isUpdating || status === 'completed'}
                className="px-4 py-2 rounded-lg border-2 border-green-300 hover:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Completed</span>
              </button>
              <button
                onClick={() => changeStatus('blocked')}
                disabled={isUpdating || status === 'blocked'}
                className="px-4 py-2 rounded-lg border-2 border-red-300 hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Blocked</span>
              </button>
            </div>
          </div>
        )}

        {/* Info Note */}
        {hasChildren && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800 flex items-start space-x-2">
              <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Tip:</strong> {node.type === 'phase' ? 'This phase' : 'This step'} will automatically be marked as completed when all {node.type === 'phase' ? 'steps' : 'substeps'} are done.
              </span>
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

