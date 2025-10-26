// Notification Panel - Project Invitations
'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';

interface Invitation {
  id: string;
  project_id: string;
  role: string;
  status: string;
  invited_at: string;
  projects: {
    id: string;
    title: string;
    jurusan: string;
    description: string;
  };
}

interface NotificationPanelProps {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { user } = useAuthContext();
  const toast = useToast();
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) {
      fetchInvitations();
    }
  }, [user]);

  const fetchInvitations = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/notifications?email=${encodeURIComponent(user.email)}`, {
        headers: {
          'x-user-id': user.uid,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations || []);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId: string, projectTitle: string) => {
    if (!user) return;

    setProcessing(invitationId);
    try {
      const response = await fetch(`/api/notifications/${invitationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify({ action: 'accept' }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`✅ Joined project: ${projectTitle}!`);
        fetchInvitations(); // Refresh list
        
        // Optionally navigate to the project
        setTimeout(() => {
          router.push(`/project/${data.project.id}`);
        }, 1000);
      } else {
        toast.error(data.error || 'Failed to accept invitation');
      }
    } catch (error) {
      toast.error('Failed to accept invitation');
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (invitationId: string) => {
    if (!user) return;

    const confirmed = confirm('Are you sure you want to decline this invitation?');
    if (!confirmed) return;

    setProcessing(invitationId);
    try {
      const response = await fetch(`/api/notifications/${invitationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify({ action: 'decline' }),
      });

      if (response.ok) {
        toast.success('Invitation declined');
        fetchInvitations(); // Refresh list
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to decline invitation');
      }
    } catch (error) {
      toast.error('Failed to decline invitation');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-96 glass-panel rounded-xl shadow-glass-lg overflow-hidden animate-slide-in-top z-50">
      {/* Header */}
      <div className="p-4 border-b border-white/20 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 dark:text-gray-100">Project Invitations</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-300 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading invitations...</p>
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📬</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">No pending invitations</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="p-4 hover:bg-white/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white flex-shrink-0">
                    📁
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                      {invitation.projects.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {invitation.projects.jurusan}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                        {invitation.role}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(invitation.invited_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAccept(invitation.id, invitation.projects.title)}
                        disabled={processing === invitation.id}
                        className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processing === invitation.id ? '⏳ Processing...' : '✅ Accept'}
                      </button>
                      <button
                        onClick={() => handleDecline(invitation.id)}
                        disabled={processing === invitation.id}
                        className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ❌ Decline
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

