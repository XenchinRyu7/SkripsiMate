// Create Project Modal Component
'use client';

import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Project } from '@/lib/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface CreateProjectModalProps {
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

const JURUSAN_OPTIONS = [
  'Teknik Informatika',
  'Sistem Informasi',
  'Ilmu Komputer',
  'Teknik Elektro',
  'Manajemen',
  'Psikologi',
  'Hukum',
  'Ekonomi',
  'Kedokteran',
  'Lainnya',
];

const TIMELINE_OPTIONS = [
  '3 months',
  '4 months',
  '5 months',
  '6 months',
  '7 months',
  '8 months',
  '9 months',
  '12 months',
];

export default function CreateProjectModal({ onClose, onProjectCreated }: CreateProjectModalProps) {
  const { user } = useAuthContext();
  const [formData, setFormData] = useState({
    title: '',
    jurusan: 'Teknik Informatika',
    timeline: '6 months',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create project in Supabase
      const newProject = {
        user_id: user.uid,
        title: formData.title.trim(),
        jurusan: formData.jurusan,
        timeline: formData.timeline,
        description: formData.description.trim() || null,
        metadata: {
          currentPhase: 'Not started',
          totalSteps: 0,
          completedSteps: 0,
          progressPercentage: 0,
          tags: [],
        },
        last_accessed_at: new Date().toISOString(),
      };

      const { data, error: insertError } = await supabase
        .from('projects')
        .insert([newProject])
        .select()
        .single();

      if (insertError) throw insertError;

      onProjectCreated(data as Project);
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.message || 'Failed to create project');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel rounded-2xl p-8 max-w-2xl w-full shadow-glass-lg animate-slide-in-bottom">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Create New Project 🎯
            </h2>
            <p className="text-sm text-gray-600">
              Start planning your thesis with AI assistance
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={loading}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <Input
            label="Thesis Title"
            placeholder="e.g., Stock Prediction using Machine Learning"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            disabled={loading}
            icon="📝"
          />

          {/* Jurusan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jurusan / Department
            </label>
            <select
              value={formData.jurusan}
              onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
              className="w-full px-4 py-3 rounded-lg glass border border-gray-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              disabled={loading}
            >
              {JURUSAN_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Timeline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeline / Duration
            </label>
            <select
              value={formData.timeline}
              onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
              className="w-full px-4 py-3 rounded-lg glass border border-gray-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              disabled={loading}
            >
              {TIMELINE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of your thesis topic..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg glass border border-gray-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/20">
            <Button
              type="button"
              variant="glass"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Creating...
                </>
              ) : (
                <>Create Project</>
              )}
            </Button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50/50 rounded-lg border border-blue-200/30">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> After creating your project, our AI will help you generate a comprehensive roadmap with actionable steps!
          </p>
        </div>
      </div>
    </div>
  );
}

