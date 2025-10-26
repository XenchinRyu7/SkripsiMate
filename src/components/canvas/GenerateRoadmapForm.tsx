// Generate Roadmap Form Component
'use client';

import { useState, useEffect } from 'react';
import { Project, Node as DBNode, supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

interface GenerateRoadmapFormProps {
  project: Project;
  onClose: () => void;
  onGenerated: (nodes: DBNode[]) => void;
}

export default function GenerateRoadmapForm({ project, onClose, onGenerated }: GenerateRoadmapFormProps) {
  const [additionalContext, setAdditionalContext] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [hasExistingNodes, setHasExistingNodes] = useState(false);
  const [generateMode, setGenerateMode] = useState<'fresh' | 'merge'>('fresh');

  // Check for existing nodes
  useEffect(() => {
    const checkExistingNodes = async () => {
      const { data } = await supabase
        .from('nodes')
        .select('id')
        .eq('project_id', project.id)
        .limit(1);
      
      setHasExistingNodes((data && data.length > 0) || false);
    };
    
    checkExistingNodes();
  }, [project.id]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');

    try {
      // Call AI API to generate roadmap
      const response = await fetch('/api/agent/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          title: project.title,
          jurusan: project.jurusan,
          timeline: project.timeline,
          description: project.description,
          additionalContext,
          generateMode: hasExistingNodes ? generateMode : 'fresh',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate roadmap');
      }

      const data = await response.json();
      onGenerated(data.nodes);
    } catch (err: any) {
      console.error('Error generating roadmap:', err);
      setError(err.message || 'Failed to generate roadmap. Please try again.');
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel rounded-2xl p-8 max-w-3xl w-full shadow-glass-lg animate-slide-in-bottom max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              🤖 Generate Thesis Roadmap
            </h2>
            {!generating && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 text-2xl"
              >
                ×
              </button>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Let AI create a comprehensive roadmap for your thesis
          </p>
        </div>

        {/* Project Info */}
        <div className="glass-card p-4 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Project Details</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Title:</span>
              <span className="ml-2 font-medium">{project.title}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Jurusan:</span>
              <span className="ml-2 font-medium">{project.jurusan}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Timeline:</span>
              <span className="ml-2 font-medium">{project.timeline}</span>
            </div>
            {project.description && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">Description:</span>
                <p className="mt-1 text-gray-700 dark:text-gray-300">{project.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Existing Nodes Warning */}
        {hasExistingNodes && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-900 mb-2">
                  Existing Nodes Detected
                </h4>
                <p className="text-sm text-yellow-800 mb-3">
                  You have existing nodes in this project. Choose how to proceed:
                </p>
                <div className="space-y-2">
                  <label className="flex items-start space-x-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-yellow-50 transition-all">
                    <input
                      type="radio"
                      name="generateMode"
                      value="fresh"
                      checked={generateMode === 'fresh'}
                      onChange={() => setGenerateMode('fresh')}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">🔄 Generate Fresh (Recommended)</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Create new roadmap separately. Existing nodes will remain.</div>
                    </div>
                  </label>
                  <label className="flex items-start space-x-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-red-50 transition-all">
                    <input
                      type="radio"
                      name="generateMode"
                      value="merge"
                      checked={generateMode === 'merge'}
                      onChange={() => setGenerateMode('merge')}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-semibold text-red-700">⚠️ Replace All</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Delete all existing nodes and generate fresh roadmap.</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Context */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional Context (Optional)
          </label>
          <textarea
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="E.g., specific requirements, focus areas, methodologies you want to use..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg glass border border-gray-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
            disabled={generating}
          />
          <p className="text-xs text-gray-500 mt-1">
            Provide any additional details to help AI generate a better roadmap
          </p>
        </div>

        {/* What Will Be Generated */}
        <div className="glass-card p-4 mb-6 bg-blue-50/50 border-blue-200/30">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            What will be generated:
          </h4>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start space-x-2">
              <span>📅</span>
              <span>5-8 major phases (Preparation, Chapters, Implementation, etc.)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span>📝</span>
              <span>3-5 actionable steps per phase</span>
            </li>
            <li className="flex items-start space-x-2">
              <span>✅</span>
              <span>Detailed substeps with checklists</span>
            </li>
            <li className="flex items-start space-x-2">
              <span>⏰</span>
              <span>Realistic time estimates for each task</span>
            </li>
            <li className="flex items-start space-x-2">
              <span>🔗</span>
              <span>Dependencies and suggested order</span>
            </li>
            <li className="flex items-start space-x-2">
              <span>💡</span>
              <span>Helpful tips and resources</span>
            </li>
          </ul>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3">
          {!generating && (
            <Button
              type="button"
              variant="glass"
              onClick={onClose}
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Generating... (30-60s)
              </>
            ) : (
              <>🤖 Generate Roadmap</>
            )}
          </Button>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-yellow-50/50 rounded-lg border border-yellow-200/30">
          <p className="text-sm text-yellow-800">
            ⚡ <strong>Note:</strong> This may take 30-60 seconds. Please wait while AI analyzes your project and creates a comprehensive roadmap.
          </p>
        </div>
      </div>
    </div>
  );
}

