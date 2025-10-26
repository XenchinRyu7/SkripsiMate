// Dashboard Page - Project Management
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsCards from '@/components/dashboard/StatsCards';
import ProjectList from '@/components/dashboard/ProjectList';
import CreateProjectModal from '@/components/dashboard/CreateProjectModal';
import ImportModal from '@/components/dashboard/ImportModal';
import TemplateModal from '@/components/dashboard/TemplateModal';
import ProjectDetailModal from '@/components/dashboard/ProjectDetailModal';
import { Project } from '@/lib/supabase';
import { FolderOpen, Lock, AlertTriangle, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const toast = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showNoSubModal, setShowNoSubModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [limitInfo, setLimitInfo] = useState<any>(null);
  const [checkingLimits, setCheckingLimits] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedTasks: 0,
    nearDeadline: 0,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Check subscription limits
  const checkLimits = async () => {
    if (!user) return;
    
    try {
      setCheckingLimits(true);
      const response = await fetch('/api/user/check-limits', {
        headers: {
          'x-user-id': user.uid,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setLimitInfo(data);
      } else {
        console.error('Check limits failed:', response.status);
        // Default to fail open
        setLimitInfo({ can_create: true, is_self_hosted: true });
      }
    } catch (error) {
      console.error('Failed to check limits:', error);
      // Fail open for self-hosted
      setLimitInfo({ can_create: true, is_self_hosted: true });
    } finally {
      setCheckingLimits(false);
    }
  };

  // Fetch projects from Supabase
  const fetchProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch projects owned by user
      const { data: ownedProjects, error: ownedError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.uid);

      if (ownedError) {
        console.error('Supabase error details:', ownedError);
        throw ownedError;
      }

      // Fetch project IDs where user is a member
      const { data: memberData, error: memberError } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', user.uid)
        .eq('status', 'active');

      if (memberError) {
        console.error('Member fetch error:', memberError);
      }

      // Fetch member projects
      let memberProjects: any[] = [];
      if (memberData && memberData.length > 0) {
        const memberProjectIds = memberData.map(m => m.project_id);
        const { data: memberProjectsData, error: memberProjectsError } = await supabase
          .from('projects')
          .select('*')
          .in('id', memberProjectIds);

        if (!memberProjectsError) {
          memberProjects = memberProjectsData || [];
        }
      }

      // Merge owned and member projects, remove duplicates
      const allProjects = [...(ownedProjects || []), ...memberProjects];
      const uniqueProjects = Array.from(
        new Map(allProjects.map(p => [p.id, p])).values()
      );

      // Sort by last_accessed_at
      uniqueProjects.sort((a, b) => 
        new Date(b.last_accessed_at).getTime() - new Date(a.last_accessed_at).getTime()
      );

      setProjects(uniqueProjects);
      
      // Calculate stats
      const activeCount = uniqueProjects.filter(p => {
        const meta = p.metadata as any;
        return meta?.progressPercentage < 100;
      }).length || 0;

      const completedTasksCount = uniqueProjects.reduce((acc, p) => {
        const meta = p.metadata as any;
        return acc + (meta?.completedSteps || 0);
      }, 0) || 0;

      setStats({
        totalProjects: uniqueProjects.length || 0,
        activeProjects: activeCount,
        completedTasks: completedTasksCount,
        nearDeadline: 0, // TODO: Calculate based on target dates
      });
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      console.error('Error message:', error?.message);
      console.error('Error details:', error?.details);
      console.error('Error hint:', error?.hint);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      checkLimits();
      fetchProjects();
    }
  }, [user, authLoading, router]);

  const handleCreateProject = () => {
    // Check if still checking limits
    if (checkingLimits) {
      return; // Don't open modal while checking
    }

    // Check if can create project
    if (!limitInfo || !limitInfo.can_create) {
      // Show no subscription modal instead
      setShowNoSubModal(true);
      return; // DON'T open create modal
    }
    
    // All checks passed - open create modal
    setShowCreateModal(true);
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects([newProject, ...projects]);
    setShowCreateModal(false);
    // Navigate to project canvas
    router.push(`/project/${newProject.id}`);
  };

  const handleOpenProject = (projectId: string) => {
    // Update last accessed time
    supabase
      .from('projects')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', projectId)
      .then(() => {
        router.push(`/project/${projectId}`);
      });
  };

  const handleDeleteProject = async (projectId: string) => {
    // Show custom confirmation (we'll implement this next)
    const confirmed = confirm('Are you sure you want to delete this project? This action cannot be undone.');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      setProjects(projects.filter(p => p.id !== projectId));
      toast.success('✅ Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project. Please try again.');
    }
  };

  const handleShowDetail = (project: Project) => {
    setSelectedProject(project);
    setShowDetailModal(true);
  };

  const handleExportProject = async (project: Project) => {
    try {
      // Fetch all nodes for this project
      const { data: nodes, error } = await supabase
        .from('nodes')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Create export data
      const exportData = {
        project: {
          title: project.title,
          description: project.description,
          jurusan: project.jurusan,
          timeline: project.timeline,
          metadata: project.metadata,
        },
        nodes: nodes || [],
        exportedAt: new Date().toISOString(),
        version: '1.0',
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mate`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`✅ Project exported successfully!`);
    } catch (error) {
      console.error('Error exporting project:', error);
      toast.error('Failed to export project. Please try again.');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Message */}
        <div className="glass-panel rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'User'}!
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-14">
            You have {stats.activeProjects} project{stats.activeProjects !== 1 ? 's' : ''} in progress
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards 
          stats={stats} 
          onCreateProject={handleCreateProject}
          onImport={() => setShowImportModal(true)}
          onTemplates={() => setShowTemplateModal(true)}
          canCreate={limitInfo?.can_create !== false}
          limitReason={limitInfo?.reason}
          isChecking={checkingLimits}
        />

        {/* Projects Section */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FolderOpen className="w-6 h-6" />
              My Projects
            </h2>
            <button
              onClick={handleCreateProject}
              disabled={(limitInfo && !limitInfo.can_create) || checkingLimits}
              className={`text-sm px-4 py-2 transition-all ${
                checkingLimits
                  ? 'bg-gray-200 text-gray-500 cursor-wait'
                  : limitInfo?.can_create !== false
                  ? 'btn-primary'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
              }`}
              title={limitInfo && !limitInfo.can_create ? limitInfo.reason : undefined}
            >
              {checkingLimits ? '⏳ Checking...' : limitInfo?.can_create !== false ? '+ Create New' : '🔒 No Subscription'}
            </button>
          </div>

          <ProjectList
            projects={projects}
            onOpenProject={handleOpenProject}
            onDeleteProject={handleDeleteProject}
            onCreateProject={handleCreateProject}
            onShowDetail={handleShowDetail}
            onExportProject={handleExportProject}
          />
        </div>
      </main>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}

      {/* Import Project Modal */}
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onProjectImported={fetchProjects}
        />
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <TemplateModal
          onClose={() => setShowTemplateModal(false)}
          onProjectCreated={fetchProjects}
        />
      )}

      {/* Project Detail Modal */}
      {showDetailModal && selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedProject(null);
          }}
        />
      )}

      {/* No Subscription Modal */}
      {showNoSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel rounded-2xl p-8 max-w-md w-full shadow-glass-lg animate-slide-in-bottom">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Subscription Required
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                You need an active subscription to create projects.
              </p>
            </div>

            {/* Limit Info */}
            {limitInfo && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900 dark:text-red-300 mb-1">
                      {limitInfo.plan === 'none' ? 'No Active Plan' : 'Limit Reached'}
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-400">
                      {limitInfo.reason || 'Please upgrade your plan to continue.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowNoSubModal(false);
                  router.push('/pricing');
                }}
                className="w-full btn-primary py-3 text-base"
              >
                💳 View Plans & Upgrade
              </button>
              <button
                onClick={() => {
                  setShowNoSubModal(false);
                  router.push('/settings?tab=subscription');
                }}
                className="w-full btn-glass py-3 text-base"
              >
                🎟️ Redeem Coupon Code
              </button>
              <button
                onClick={() => setShowNoSubModal(false)}
                className="w-full btn-glass py-3 text-base"
              >
                Cancel
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-blue-50/50 rounded-lg border border-blue-200/30">
              <p className="text-sm text-blue-800">
                💡 <strong>Self-Hosted?</strong> Set <code className="bg-blue-100 px-1 rounded">NEXT_PUBLIC_DEPLOYMENT_MODE=self-hosted</code> in your .env file for unlimited access.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

