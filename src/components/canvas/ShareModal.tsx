// Share Modal - Invite Collaborators
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { Project } from '@/lib/supabase';
import { useAuthContext } from '@/contexts/AuthContext';
import { Trash2 } from 'lucide-react';

interface ShareModalProps {
  project: Project;
  onClose: () => void;
}

interface Member {
  id: string;
  project_id: string;
  user_id?: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer' | 'admin';
  status: 'active' | 'pending';
  created_at?: string;
}

export function ShareModal({ project, onClose }: ShareModalProps) {
  const toast = useToast();
  const { user } = useAuthContext();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('editor');
  const [inviting, setInviting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [removing, setRemoving] = useState<string | null>(null);

  // Check if cloud mode
  const isCloudMode = process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === 'cloud';

  // Fetch members on mount
  useEffect(() => {
    if (user) {
      fetchMembers();
    }
  }, [user]);

  const fetchMembers = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${project.id}/members`, {
        headers: {
          'x-user-id': user.uid,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      } else {
        console.error('Failed to fetch members');
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !email.trim()) return;
    
    setInviting(true);
    try {
      const response = await fetch(`/api/projects/${project.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify({ email: email.trim(), role }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`✅ Invitation sent to ${email}!`);
        setEmail('');
        fetchMembers(); // Refresh members list
      } else {
        toast.error(data.error || 'Failed to invite member');
      }
    } catch (error) {
      toast.error('Failed to invite member. Please try again.');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberUserId: string, memberEmail: string) => {
    if (!user) return;
    
    const confirmed = confirm(`Remove ${memberEmail} from this project?`);
    if (!confirmed) return;

    setRemoving(memberUserId);
    try {
      const response = await fetch(`/api/projects/${project.id}/members/${memberUserId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.uid,
        },
      });

      if (response.ok) {
        toast.success(`✅ ${memberEmail} removed from project`);
        fetchMembers(); // Refresh members list
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to remove member');
      }
    } catch (error) {
      toast.error('Failed to remove member. Please try again.');
    } finally {
      setRemoving(null);
    }
  };

  const isOwner = project.user_id === user?.uid;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card variant="glass-card" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Share Project</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{project.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Self-Hosted Banner */}
          {!isCloudMode && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🏠</span>
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">
                    Self-Hosted Mode - Full Access
                  </h3>
                  <p className="text-sm text-green-700">
                    You're running in self-hosted mode. Invite unlimited team members for free!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cloud Mode Banner */}
          {isCloudMode && (
            <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl">☁️</span>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">
                    Cloud Mode
                  </h3>
                  <p className="text-sm text-blue-700">
                    Collaboration is available on all cloud plans. Invite your team members!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Invite Form - Now Enabled! */}
          {isOwner && (
            <form onSubmit={handleInvite} className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Invite by Email
              </label>
              <div className="flex gap-3 mb-3">
                <Input
                  type="email"
                  placeholder="colleague@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  disabled={inviting}
                  required
                />
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
                  disabled={inviting}
                >
                  <option value="editor">Can Edit</option>
                  <option value="viewer">Can View</option>
                </select>
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={inviting || !email.trim()}
                  isLoading={inviting}
                >
                  {inviting ? 'Inviting...' : 'Invite'}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                💡 Email invitation will be sent to the collaborator
              </p>
            </form>
          )}

          {/* Current Members */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Project Members ({members.length})
            </h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading members...</p>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No members yet. Invite someone to collaborate!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                        {member.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{member.email}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 capitalize flex items-center gap-2">
                          <span>{member.role}</span>
                          {member.status === 'pending' && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                              ⏳ Pending Accept
                            </span>
                          )}
                          {member.status === 'active' && member.role !== 'owner' && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                              ✅ Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        member.role === 'owner' 
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' 
                          : member.role === 'editor'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}>
                        {member.role === 'owner' ? '👑 Owner' : member.role}
                      </span>
                      
                      {/* Remove button - only owner can remove, except owner itself */}
                      {isOwner && member.role !== 'owner' && member.user_id && (
                        <button
                          onClick={() => handleRemoveMember(member.user_id!, member.email)}
                          disabled={removing === member.user_id}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors disabled:opacity-50"
                          title="Remove member"
                        >
                          {removing === member.user_id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Roles Explanation */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Role Permissions</h4>
            <div className="space-y-2 text-sm text-blue-700">
              <div>
                <strong>👑 Owner:</strong> Full control - edit, invite, delete project
              </div>
              <div>
                <strong>✏️ Editor:</strong> Can edit nodes, add comments, view all
              </div>
              <div>
                <strong>👀 Viewer:</strong> Read-only access, cannot make changes
              </div>
            </div>
          </div>

          {/* Note for Non-Owners */}
          {!isOwner && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Only the project owner can invite new members.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

