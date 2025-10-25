// Canvas Editor Page - Project Workspace
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
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

  // Fetch project data
  const fetchProject = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.uid)
        .single();

      if (projectError) throw projectError;

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
      }
    } catch (error: any) {
      console.error('Error fetching project:', error);
      if (error.code === 'PGRST116') {
        // Project not found or unauthorized
        alert('Project not found or unauthorized');
        router.push('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && projectId) {
      fetchProject();
    }
  }, [user, authLoading, projectId, router]);

  const handleRoadmapGenerated = (generatedNodes: DBNode[]) => {
    setNodes(generatedNodes);
    setShowGenerateForm(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // All changes are auto-saved already, this is just a manual trigger
      // Could be used to trigger a full sync or show success message
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate save
      alert('✅ All changes saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('❌ Failed to save changes');
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
            onNodesChange={setNodes}
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

