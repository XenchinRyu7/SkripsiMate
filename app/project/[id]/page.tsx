// Canvas Editor Page - Project Workspace
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { clientLogger } from '@/lib/logger';
import { Project, Node as DBNode } from '@/lib/supabase';
import CanvasBoard from '@/components/canvas/CanvasBoard';
import AIChatPanel from '@/components/canvas/AIChatPanel';
import CanvasHeader from '@/components/canvas/CanvasHeader';
import GenerateRoadmapForm from '@/components/canvas/GenerateRoadmapForm';
import ExportModal from '@/components/canvas/ExportModal';
import SettingsModal from '@/components/canvas/SettingsModal';
import { ShareModal } from '@/components/canvas/ShareModal';

export default function ProjectCanvasPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { user, loading: authLoading } = useAuthContext();
  const toast = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [nodes, setNodes] = useState<DBNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch project data (metadata only, for progress updates)
  const fetchProjectMetadata = async () => {
    if (!user) return;

    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('metadata, updated_at')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // Update only metadata & updated_at
      if (project && projectData) {
        setProject({
          ...project,
          metadata: projectData.metadata,
          updated_at: projectData.updated_at,
        });
      }
    } catch (error) {
      console.error('Error fetching project metadata:', error);
    }
  };

  // Fetch project data
  const fetchProject = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch project - check both owner and member access
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // Check if user has access (owner or member)
      const isOwner = projectData.user_id === user.uid;
      let isMember = false;

      if (!isOwner) {
        // Check if user is a member
        const { data: memberData } = await supabase
          .from('project_members')
          .select('id')
          .eq('project_id', projectId)
          .eq('user_id', user.uid)
          .eq('status', 'active')
          .single();

        isMember = !!memberData;
      }

      if (!isOwner && !isMember) {
        throw new Error('UNAUTHORIZED');
      }

      setProject(projectData as Project);

      // Fetch nodes
      const { data: nodesData, error: nodesError } = await supabase
        .from('nodes')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (nodesError) throw nodesError;

      setNodes(nodesData as DBNode[] || []);

      // Show generate form if no nodes yet
      if (!nodesData || nodesData.length === 0) {
        setShowGenerateForm(true);
      } else {
        // Auto-recalculate progress for old projects without progressPercentage
        const metadata = projectData.metadata as any;
        if (!metadata?.progressPercentage && nodesData.length > 0) {
          clientLogger.info('Old project detected, recalculating progress...');
          try {
            const recalcResponse = await fetch(`/api/projects/${projectId}/recalculate`, {
              method: 'POST',
            });
            if (recalcResponse.ok) {
              const { project: updatedProject, nodes: updatedNodes } = await recalcResponse.json();
              setProject(updatedProject as Project);
              setNodes(updatedNodes as DBNode[] || []);
              toast.success('Project progress calculated!');
            }
          } catch (error) {
            console.error('Failed to recalculate progress:', error);
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching project:', error);
      if (error.code === 'PGRST116' || error.message === 'UNAUTHORIZED') {
        // Project not found or unauthorized
        toast.error('Project not found or you do not have access');
        router.push('/dashboard');
      } else {
        toast.error('Failed to load project');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle node updates (called by CanvasBoard)
  const handleNodesUpdate = (updatedNodes: DBNode[]) => {
    setNodes(updatedNodes);
    // Refetch project metadata to get updated progress
    fetchProjectMetadata();
  };

  // Handle project update (called by CanvasBoard after recalculate)
  const handleProjectUpdate = (updatedProject: Project) => {
    clientLogger.debug('📥', 'handleProjectUpdate called with:', updatedProject);
    clientLogger.debug('📈', 'New progress:', (updatedProject.metadata as any)?.progressPercentage);
    setProject(updatedProject);
    clientLogger.debug('✅', 'Project state updated!');
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && projectId) {
      fetchProject();
    }
  }, [user, authLoading, projectId, router]);

  const handleRoadmapGenerated = async (generatedNodes: DBNode[]) => {
    clientLogger.info('🎨 AI generation complete! Updating canvas with', generatedNodes.length, 'nodes');
    
    // Update nodes state
    setNodes(generatedNodes);
    
    // Call onNodesChange to ensure proper state propagation
    handleNodesUpdate(generatedNodes);
    
    // Refetch project metadata to get updated progress
    await fetchProjectMetadata();
    
    // Close generate form
    setShowGenerateForm(false);
    
    toast.success(`Successfully generated ${generatedNodes.length} nodes! 🎉`);
    clientLogger.debug('✅', 'Canvas updated successfully!');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // All changes are auto-saved already, this is just a manual trigger
      // Could be used to trigger a full sync or show success message
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate save
      toast.success('All changes saved successfully!');
    } catch (error) {
      clientLogger.error('Save error:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAI = () => {
    setShowGenerateForm(true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Project not found</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-primary mt-4"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col gradient-bg overflow-hidden">
      {/* Header */}
      <CanvasHeader
        project={project}
        onBack={() => router.push('/dashboard')}
        onToggleChat={() => setChatOpen(!chatOpen)}
        chatOpen={chatOpen}
        onSave={handleSave}
        saving={saving}
        onShare={() => setShowShareModal(true)}
        onExport={() => setShowExportModal(true)}
        onSettings={() => setShowSettingsModal(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Board */}
        <div className={`flex-1 transition-all duration-300 ${chatOpen ? 'w-4/5' : 'w-full'}`}>
          <CanvasBoard
            projectId={projectId}
            nodes={nodes}
            onNodesChange={handleNodesUpdate}
            onProjectUpdate={handleProjectUpdate}
            onGenerateAI={handleGenerateAI}
            isGenerating={showGenerateForm}
            project={project}
          />
        </div>

        {/* AI Chat Panel */}
        {chatOpen && (
          <div className="w-1/5 min-w-[300px] max-w-[400px] border-l border-white/20 animate-slide-in-right">
            <AIChatPanel
              projectId={projectId}
              project={project}
              onClose={() => setChatOpen(false)}
              onNodesCreated={() => {
                // Refresh project data when AI creates nodes
                fetchProject();
              }}
            />
          </div>
        )}
      </div>

      {/* Generate Roadmap Form */}
      {showGenerateForm && (
        <GenerateRoadmapForm
          project={project}
          onClose={() => setShowGenerateForm(false)}
          onGenerated={handleRoadmapGenerated}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          project={project}
          nodes={nodes}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}

      {/* Share/Collaboration Modal */}
      {showShareModal && project && (
        <ShareModal
          project={project}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}

