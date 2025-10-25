// Share Modal - Invite Collaborators (Coming Soon)
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Project } from '@/lib/supabase';

interface ShareModalProps {
  project: Project;
  onClose: () => void;
}

export function ShareModal({ project, onClose }: ShareModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('editor');
  const [inviting, setInviting] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Placeholder - will be implemented later
    alert('Collaboration feature is coming soon! Stay tuned for updates. 🚀');
    setEmail('');
  };

  // Mock data for demonstration
  const mockMembers = [
    {
      id: '1',
      email: 'you@example.com',
      role: 'owner',
      status: 'active',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card variant="glass-card" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Share Project</h2>
              <p className="text-gray-600 mt-1">{project.title}</p>
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

          {/* Coming Soon Banner */}
          <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🚧</span>
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">
                  Collaboration Feature Coming Soon!
                </h3>
                <p className="text-sm text-amber-700">
                  Team collaboration with real-time sync is currently in development. 
                  This will be available for cloud-hosted plans (Starter, Pro, Enterprise).
                </p>
              </div>
            </div>
          </div>

          {/* Invite Form (Disabled) */}
          <form onSubmit={handleInvite} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invite by Email
            </label>
            <div className="flex gap-3 mb-3">
              <Input
                type="email"
                placeholder="colleague@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                disabled
              />
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                value={role}
                onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
                disabled
              >
                <option value="editor">Can Edit</option>
                <option value="viewer">Can View</option>
              </select>
              <Button type="submit" variant="primary" disabled>
                Invite
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              💡 Collaborators will receive an email invitation to join this project
            </p>
          </form>

          {/* Current Members */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Project Members ({mockMembers.length})
            </h3>
            <div className="space-y-2">
              {mockMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                      {member.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{member.email}</div>
                      <div className="text-sm text-gray-500 capitalize">{member.role}</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    {member.role === 'owner' ? '👑 Owner' : member.role}
                  </span>
                </div>
              ))}
            </div>
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

          {/* Feature Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Want early access to collaboration features?
            </p>
            <Button
              variant="glass"
              onClick={() => window.location.href = '/pricing'}
            >
              View Cloud Plans →
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

