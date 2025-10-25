// Canvas Board Component - React Flow Integration
'use client';

import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Panel,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Node as DBNode } from '@/lib/supabase';
import PhaseNode from './nodes/PhaseNode';
import StepNode from './nodes/StepNode';
import NodeDetailPanel from './NodeDetailPanel';
import NodeToolbar from './NodeToolbar';
import EdgeStyleToolbar from './EdgeStyleToolbar';

interface CanvasBoardProps {
  projectId: string;
  nodes: DBNode[];
  onNodesChange: (nodes: DBNode[]) => void;
  onGenerateAI?: () => void;
  isGenerating?: boolean;
  project?: any;
}

// Custom node types
const nodeTypes: any = {
  phase: PhaseNode,
  step: StepNode,
  substep: StepNode, // Reuse StepNode for substeps
  checklist: StepNode, // Reuse StepNode for checklists
};

// Convert DB nodes to React Flow format
const convertToReactFlowNodes = (dbNodes: DBNode[]): Node[] => {
  return dbNodes.map((node) => {
    const position = node.position as any;
    return {
      id: node.id,
      type: node.type,
      position: position || { x: 100, y: 100 },
      data: {
        ...node,
        label: node.title,
      },
    };
  });
};

// Generate edges from parent-child relationships, phase progressions, and custom edges  
const generateEdges = (dbNodes: DBNode[], project?: any): Edge[] => {
  const edges: Edge[] = [];
  
  // 1. Create parent-child edges (phase -> steps, step -> substeps)
  dbNodes.forEach((node) => {
    if (node.parent_id) {
      const parent = dbNodes.find(n => n.id === node.parent_id);
      
      if (node.type === 'step' && parent?.type === 'phase') {
        // Phase -> Step connection (vertical down)
      edges.push({
        id: `e-${node.parent_id}-${node.id}`,
        source: node.parent_id,
          sourceHandle: 'phase-steps',
        target: node.id,
          targetHandle: 'step-top',
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      });
      } else if (node.type === 'substep' && parent?.type === 'step') {
        // Step -> Substep connection (vertical down)
        edges.push({
          id: `e-${node.parent_id}-${node.id}`,
          source: node.parent_id,
          sourceHandle: 'step-bottom',
          target: node.id,
          targetHandle: 'step-top',
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#8b5cf6', strokeWidth: 2 },
        });
      }
    }
  });

  // 2. Create phase-to-phase progression edges (Phase 1 -> Phase 2 -> Phase 3)
  const phases = dbNodes
    .filter(node => node.type === 'phase')
    .sort((a, b) => {
      const aIndex = (a.metadata as any)?.phaseIndex || 0;
      const bIndex = (b.metadata as any)?.phaseIndex || 0;
      return aIndex - bIndex;
    });

  for (let i = 0; i < phases.length - 1; i++) {
    const currentPhase = phases[i];
    const nextPhase = phases[i + 1];
    
    edges.push({
      id: `e-phase-${currentPhase.id}-${nextPhase.id}`,
      source: currentPhase.id,
      sourceHandle: 'phase-right',
      target: nextPhase.id,
      targetHandle: 'phase-left',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#10b981', strokeWidth: 3, strokeDasharray: '5,5' },
      label: '→',
      labelStyle: { fill: '#10b981', fontWeight: 600 },
      labelBgStyle: { fill: 'white' },
    });
  }

  // 3. Add custom edges from project metadata
  if (project?.metadata) {
    const customEdges = (project.metadata as any).customEdges || [];
    customEdges.forEach((customEdge: any) => {
      // Only add if not already exists (avoid duplicates with parent-child)
      const exists = edges.some(e => e.id === customEdge.id);
      if (!exists) {
        edges.push({
          id: customEdge.id,
          source: customEdge.source,
          target: customEdge.target,
          sourceHandle: customEdge.sourceHandle,
          targetHandle: customEdge.targetHandle,
          type: customEdge.type || 'smoothstep',
          animated: customEdge.animated || false,
          style: customEdge.style || { stroke: '#6b7280', strokeWidth: 2 },
          markerStart: customEdge.markerStart,
          markerEnd: customEdge.markerEnd,
        });
      }
    });
  }

  // 4. Filter out deleted edges (user manually deleted auto-generated edges)
  if (project?.metadata) {
    const deletedEdges = (project.metadata as any).deletedEdges || [];
    return edges.filter(edge => !deletedEdges.includes(edge.id));
  }

  return edges;
};

export default function CanvasBoard({ projectId, nodes: dbNodes, onNodesChange, onGenerateAI, isGenerating, project }: CanvasBoardProps) {
  const [nodes, setNodes, onNodesChangeHandler] = useNodesState(convertToReactFlowNodes(dbNodes));
  const [edges, setEdges, onEdgesChangeHandler] = useEdgesState(generateEdges(dbNodes, project));
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedNodeForDetail, setSelectedNodeForDetail] = useState<DBNode | null>(null);
  const [isAutoFormatting, setIsAutoFormatting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEdgeMode, setIsEdgeMode] = useState(false);
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  const [selectedEdgeForStyle, setSelectedEdgeForStyle] = useState<Edge | null>(null);
  const [edgeToolbarPosition, setEdgeToolbarPosition] = useState({ x: 0, y: 0 });

  const onConnect = useCallback(
    async (params: Connection) => {
      // Add edge to local state
      setEdges((eds) => addEdge({
        ...params,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#6b7280', strokeWidth: 2 },
      }, eds));

      // Save edge to database (store in node metadata or separate edges table)
      try {
        await fetch(`/api/edges`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            source: params.source,
            target: params.target,
            sourceHandle: params.sourceHandle,
            targetHandle: params.targetHandle,
          }),
        });
      } catch (error) {
        console.error('Failed to save edge:', error);
      }
    },
    [setEdges, projectId]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    // Find the DB node from the clicked React Flow node
    const dbNode = dbNodes.find(n => n.id === node.id);
    if (dbNode) {
      setSelectedNodeForDetail(dbNode);
    }
  }, [dbNodes]);

  const onSelectionChange = useCallback(({ nodes }: { nodes: Node[] }) => {
    setSelectedNodes(nodes.map(n => n.id));
  }, []);

  // Auto-save node positions when dragged
  const onNodeDragStop = useCallback(async (event: React.MouseEvent, node: Node) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/nodes/${node.id}/position`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: node.position }),
      });
      
      if (!response.ok) {
        console.error('Failed to save node position');
      }
    } catch (error) {
      console.error('Error saving node position:', error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Auto-format: Reorganize all nodes to proper tree structure
  const autoFormatNodes = useCallback(async () => {
    setIsAutoFormatting(true);
    
    try {
      // Call API to recalculate positions
      const response = await fetch(`/api/nodes/auto-format`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        throw new Error('Failed to auto-format nodes');
      }

      const { nodes: formattedNodes } = await response.json();
      
      // Update local state with new positions
      setNodes(convertToReactFlowNodes(formattedNodes));
      
      // Notify parent component
      onNodesChange(formattedNodes);
      
    } catch (error) {
      console.error('Error auto-formatting:', error);
      alert('Failed to auto-format nodes. Please try again.');
    } finally {
      setIsAutoFormatting(false);
    }
  }, [projectId, setNodes, onNodesChange]);

  // Handle node updates from detail panel
  const handleNodeUpdate = useCallback((updatedNodes: DBNode[]) => {
    // Update React Flow nodes with new data
    setNodes(convertToReactFlowNodes(updatedNodes));
    
    // Update edges in case status affects visualization
    setEdges(generateEdges(updatedNodes, project));
    
    // Notify parent component
    onNodesChange(updatedNodes);
    
    // Update selected node if it was updated
    if (selectedNodeForDetail) {
      const updatedSelectedNode = updatedNodes.find(n => n.id === selectedNodeForDetail.id);
      if (updatedSelectedNode) {
        setSelectedNodeForDetail(updatedSelectedNode);
      }
    }
  }, [setNodes, setEdges, onNodesChange, selectedNodeForDetail, project]);

  // Add node manually
  const handleAddNode = useCallback(async (type: 'phase' | 'step' | 'substep') => {
    setIsAddingNode(true);
    
    try {
      // Calculate center position of current viewport
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const response = await fetch(`/api/nodes/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          type,
          title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
          position: { x: centerX, y: centerY },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create node');
      }

      const { nodes: updatedNodes } = await response.json();
      
      // Update local state
      setNodes(convertToReactFlowNodes(updatedNodes));
      onNodesChange(updatedNodes);
      
    } catch (error) {
      console.error('Error adding node:', error);
      alert('Failed to add node. Please try again.');
    } finally {
      setIsAddingNode(false);
    }
  }, [projectId, setNodes, onNodesChange]);

  // Toggle edge mode
  const toggleEdgeMode = useCallback(() => {
    setIsEdgeMode(prev => !prev);
  }, []);

  // Handle edge click - Show style toolbar
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    setSelectedEdges([edge.id]);
    setSelectedEdgeForStyle(edge);
    
    // Calculate toolbar position (center of click)
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setEdgeToolbarPosition({
      x: event.clientX,
      y: event.clientY - 20, // Above the edge
    });
  }, []);

  // Handle edge style update from toolbar
  const handleEdgeStyleUpdate = useCallback(async (edgeId: string, updates: any) => {
    // Update local state
    setEdges((eds) => 
      eds.map((e) => 
        e.id === edgeId 
          ? { ...e, ...updates } 
          : e
      )
    );

    // Save to database
    try {
      const encodedEdgeId = encodeURIComponent(edgeId);
      const response = await fetch(`/api/edges/${encodedEdgeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, updates }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error('Failed to update edge style:', error);
      }
    } catch (error) {
      console.error('Failed to update edge style:', error);
    }
  }, [setEdges, projectId]);

  // Handle edge deletion from toolbar
  const handleEdgeDelete = useCallback(async (edgeId: string) => {
    // Delete from local state
    setEdges((eds) => eds.filter(e => e.id !== edgeId));
    
    // Delete from database
    try {
      const encodedEdgeId = encodeURIComponent(edgeId);
      const response = await fetch(`/api/edges/${encodedEdgeId}?projectId=${projectId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error('Failed to delete edge:', error);
      }
    } catch (error) {
      console.error('Failed to delete edge:', error);
    }
  }, [setEdges, projectId]);

  // Handle edge deletion (keyboard or multi-select)
  const onEdgesDelete = useCallback(async (edgesToDelete: Edge[]) => {
    // Delete from local state
    setEdges((eds) => eds.filter(e => !edgesToDelete.find(del => del.id === e.id)));
    
    // Delete from database
    try {
      for (const edge of edgesToDelete) {
        const encodedEdgeId = encodeURIComponent(edge.id);
        const response = await fetch(`/api/edges/${encodedEdgeId}?projectId=${projectId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const error = await response.text();
          console.error('Failed to delete edge:', edge.id, error);
        }
      }
    } catch (error) {
      console.error('Failed to delete edges:', error);
    }
  }, [setEdges, projectId]);

  // Handle node deletion
  const onNodesDelete = useCallback(async (nodesToDelete: Node[]) => {
    // Delete from local state (React Flow will handle this)
    setNodes((nds) => nds.filter(n => !nodesToDelete.find(del => del.id === n.id)));
    
    // Delete from database
    try {
      for (const node of nodesToDelete) {
        const response = await fetch(`/api/nodes/${node.id}?projectId=${projectId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const error = await response.text();
          console.error('Failed to delete node:', node.id, error);
        } else {
          console.log('Node deleted successfully:', node.id);
        }
      }
      
      // Refresh the page data to get updated nodes and edges
      if (onNodesChange) {
        // Fetch updated nodes
        const updatedDbNodes = dbNodes.filter(
          (n) => !nodesToDelete.find((del) => del.id === n.id)
        );
        onNodesChange(updatedDbNodes);
      }
    } catch (error) {
      console.error('Failed to delete nodes:', error);
    }
  }, [setNodes, projectId, dbNodes, onNodesChange]);

  // Empty state - but still show canvas with toolbar
  const isEmpty = dbNodes.length === 0;

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChangeHandler}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        onEdgeClick={onEdgeClick}
        onSelectionChange={onSelectionChange}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={3}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        className="bg-transparent"
        deleteKeyCode="Delete"
        edgesFocusable={true}
        connectionMode={ConnectionMode.Loose}
      >
        {/* SVG Marker Definitions */}
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <defs>
            {/* Arrow Marker */}
            <marker
              id="arrow"
              markerWidth="12"
              markerHeight="12"
              refX="10"
              refY="6"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M2,2 L2,10 L10,6 L2,2" fill="currentColor" />
            </marker>
            {/* Dot Marker */}
            <marker
              id="dot"
              markerWidth="8"
              markerHeight="8"
              refX="4"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <circle cx="4" cy="4" r="3" fill="currentColor" />
            </marker>
          </defs>
        </svg>

        {/* Controls */}
        <Controls
          className="glass-panel rounded-lg shadow-glass"
          showInteractive={false}
        />

        {/* Minimap */}
        <MiniMap
          className="glass-panel rounded-lg shadow-glass"
          nodeColor={(node) => {
            switch (node.type) {
              case 'phase':
                return '#3b82f6';
              case 'step':
                return '#8b5cf6';
              case 'substep':
                return '#ec4899';
              default:
                return '#6b7280';
            }
          }}
          maskColor="rgba(255, 255, 255, 0.2)"
        />

        {/* Background */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(148, 163, 184, 0.2)"
        />

        {/* Info Panel */}
        <Panel position="top-left" className="glass-panel rounded-lg px-4 py-2 text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              📊 {dbNodes.length} nodes
            </span>
            <span className="text-gray-600">
              🔗 {edges.length} connections
            </span>
            {selectedNodes.length > 0 && (
              <span className="text-blue-600 font-medium">
                ✓ {selectedNodes.length} selected
              </span>
            )}
            {isSaving && (
              <span className="text-green-600 text-xs">
                💾 Saving...
              </span>
            )}
          </div>
        </Panel>

        {/* Empty State Message */}
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="text-center max-w-md glass-panel rounded-2xl p-8 pointer-events-auto shadow-glass-lg">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Empty Canvas
              </h3>
              <p className="text-gray-600 mb-4">
                Start creating your roadmap by:
              </p>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
                  <span className="text-2xl">📦</span>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">Manual Create</div>
                    <div className="text-xs text-gray-600">Click toolbar below to add Phase, Step, or Substep cards</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                  <span className="text-2xl">🤖</span>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-purple-700">AI Generate</div>
                    <div className="text-xs text-gray-600">Click "AI Generate" in toolbar for instant roadmap</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Auto-format Button Panel */}
        <Panel position="top-right" className="glass-panel rounded-lg px-4 py-2">
          <button
            onClick={autoFormatNodes}
            disabled={isAutoFormatting}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm shadow-lg hover:shadow-xl"
          >
            {isAutoFormatting ? (
              <>
                <span className="inline-block animate-spin">⏳</span>
                <span>Formatting...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>Auto Format</span>
              </>
            )}
          </button>
        </Panel>

        {/* Instructions */}
        <Panel position="bottom-left" className="glass-panel rounded-lg px-4 py-2 text-xs text-gray-600 mb-24">
          <div className="space-y-1">
            <div>🖱️ <strong>Click</strong> node to view details</div>
            <div>🖱️ <strong>Drag</strong> to move nodes (auto-save)</div>
            <div>🔗 <strong>Drag</strong> from handle to create connection</div>
            <div>🎨 <strong>Click edge</strong> to style (type, arrows, delete)</div>
            <div>⌨️ <strong>Delete</strong> key to remove selected edges</div>
            <div>⌘/Ctrl + <strong>Drag</strong> to pan</div>
            <div>🔍 <strong>Scroll</strong> to zoom</div>
          </div>
        </Panel>
      </ReactFlow>

      {/* Node Detail Panel */}
      {selectedNodeForDetail && (
        <NodeDetailPanel
          node={selectedNodeForDetail}
          allNodes={dbNodes}
          onClose={() => setSelectedNodeForDetail(null)}
          onUpdate={handleNodeUpdate}
        />
      )}

      {/* Node Toolbar */}
      <NodeToolbar
        onAddNode={handleAddNode}
        isEdgeMode={isEdgeMode}
        onToggleEdgeMode={toggleEdgeMode}
        isAddingNode={isAddingNode}
        onGenerateAI={onGenerateAI}
        isGenerating={isGenerating}
      />

      {/* Edge Style Toolbar */}
      {selectedEdgeForStyle && (
        <EdgeStyleToolbar
          edge={selectedEdgeForStyle}
          position={edgeToolbarPosition}
          onUpdate={handleEdgeStyleUpdate}
          onDelete={handleEdgeDelete}
          onClose={() => {
            setSelectedEdgeForStyle(null);
            setSelectedEdges([]);
          }}
        />
      )}
    </div>
  );
}

