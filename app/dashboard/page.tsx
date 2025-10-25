// Dashboard Page - Project Management
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsCards from '@/components/dashboard/StatsCards';
import ProjectList from '@/components/dashboard/ProjectList';
import CreateProjectModal from '@/components/dashboard/CreateProjectModal';
import { Project } from '@/lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
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

  // Fetch projects from Supabase
  const fetchProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.uid)
        .order('last_accessed_at', { ascending: false });

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      setProjects(data || []);
      
      // Calculate stats
      const activeCount = data?.filter(p => {
        const meta = p.metadata as any;
        return meta?.progressPercentage < 100;
      }).length || 0;

      const completedTasksCount = data?.reduce((acc, p) => {
        const meta = p.metadata as any;
        return acc + (meta?.completedSteps || 0);
      }, 0) || 0;

      setStats({
        totalProjects: data?.length || 0,
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
      fetchProjects();
    }
  }, [user, authLoading, router]);

  const handleCreateProject = () => {
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
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your projects...</p>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'User'}! 👋
          </h1>
          <p className="text-gray-600">
            You have {stats.activeProjects} project{stats.activeProjects !== 1 ? 's' : ''} in progress
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} onCreateProject={handleCreateProject} />

        {/* Projects Section */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">📂 My Projects</h2>
            <button
              onClick={handleCreateProject}
              className="btn-primary text-sm px-4 py-2"
            >
              + Create New
            </button>
          </div>

          <ProjectList
            projects={projects}
            onOpenProject={handleOpenProject}
            onDeleteProject={handleDeleteProject}
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
    </div>
  );
}

