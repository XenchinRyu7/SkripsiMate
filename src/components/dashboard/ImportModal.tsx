// Import Project Modal
'use client';

import { useState, useRef } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface ImportModalProps {
  onClose: () => void;
  onProjectImported: () => void;
}

export default function ImportModal({ onClose, onProjectImported }: ImportModalProps) {
  const { user } = useAuthContext();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [fileInfo, setFileInfo] = useState<{name: string; format: string} | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'mate' && extension !== 'json') {
      setError('Please select a .mate or .json file');
      return;
    }

    setFileInfo({
      name: file.name,
      format: extension === 'mate' ? 'SkripsiMate (.mate)' : 'JSON (.json)',
    });
    setError('');
  };

  const handleImport = async () => {
    if (!user || !fileInputRef.current?.files?.[0]) return;

    const file = fileInputRef.current.files[0];
    setImporting(true);
    setError('');

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate format
      if (data.format === 'SkripsiMate') {
        // Import .mate format
        await importMateFormat(data);
      } else if (data.project && data.nodes) {
        // Import old JSON format
        await importJSONFormat(data);
      } else {
        throw new Error('Invalid file format');
      }

      onProjectImported();
      onClose();
      router.refresh();
    } catch (err: any) {
      console.error('Import error:', err);
      setError(err.message || 'Failed to import project. Please check the file format.');
    } finally {
      setImporting(false);
    }
  };

  const importMateFormat = async (data: any) => {
    if (!user) return;

    // Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.uid,
        title: data.project.title + ' (Imported)',
        jurusan: data.project.jurusan,
        timeline: data.project.timeline,
        description: data.project.description || '',
        metadata: {
          progressPercentage: 0, // Reset progress for imported project
          totalSteps: data.statistics.totalSteps,
          completedSteps: 0,
          currentPhase: data.roadmap[0]?.title || 'Phase 1',
        },
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // Import nodes with proper parent mapping
    let orderIndex = 0;

    for (const phase of data.roadmap) {
      // Create phase node
      const { data: phaseNode, error: phaseError } = await supabase
        .from('nodes')
        .insert({
          project_id: project.id,
          title: phase.title,
          description: phase.description || '',
          type: 'phase',
          level: 1,
          parent_id: null,
          order_index: orderIndex++,
          status: 'pending',
          priority: phase.priority || 'medium',
          position: { x: 100, y: 100 },
          metadata: {
            phaseIndex: phase.phaseNumber - 1,
            estimatedTime: phase.estimatedTime,
            progress: 0,
          },
        })
        .select()
        .single();

      if (phaseError) throw phaseError;

      // Create step nodes
      for (const step of phase.steps) {
        const { data: stepNode, error: stepError } = await supabase
          .from('nodes')
          .insert({
            project_id: project.id,
            title: step.title,
            description: step.description || '',
            type: 'step',
            level: 2,
            parent_id: phaseNode.id,
            order_index: orderIndex++,
            status: 'pending',
            priority: step.priority || 'medium',
            position: { x: 100, y: 100 },
            metadata: {
              estimatedTime: step.estimatedTime,
              dependencies: step.dependencies || [],
            },
          })
          .select()
          .single();

        if (stepError) throw stepError;

        // Create substep nodes
        if (step.substeps && step.substeps.length > 0) {
          const substepNodes = step.substeps.map((substep: any, subIndex: number) => ({
            project_id: project.id,
            title: substep.title,
            description: substep.description || '',
            type: 'substep',
            level: 3,
            parent_id: stepNode.id,
            order_index: orderIndex + subIndex,
            status: 'pending',
            priority: substep.priority || 'medium',
            position: { x: 100, y: 100 },
            metadata: {},
          }));

          orderIndex += substepNodes.length;

          const { error: substepsError } = await supabase
            .from('nodes')
            .insert(substepNodes);

          if (substepsError) throw substepsError;
        }
      }
    }

    // Redirect to project
    router.push(`/project/${project.id}`);
  };

  const importJSONFormat = async (data: any) => {
    if (!user) return;

    // Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.uid,
        title: data.project.title + ' (Imported)',
        jurusan: data.project.jurusan,
        timeline: data.project.timeline,
        description: data.project.description || '',
        metadata: {
          progressPercentage: 0,
          totalSteps: 0,
          completedSteps: 0,
          currentPhase: 'Phase 1',
        },
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // Import nodes (update project_id, reset status)
    const importedNodes = data.nodes.map((node: any) => ({
      ...node,
      project_id: project.id,
      status: 'pending', // Reset status
    }));

    const { error: nodesError } = await supabase
      .from('nodes')
      .insert(importedNodes);

    if (nodesError) throw nodesError;

    // Redirect to project
    router.push(`/project/${project.id}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">📥 Import Project</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Import a previously exported project from .mate or .json file.
        </p>

        <div className="space-y-4">
          {/* File Input */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".mate,.json"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-colors cursor-pointer glass"
            >
              <div className="text-4xl mb-2">📁</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {fileInfo ? fileInfo.name : 'Click to select file'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {fileInfo ? fileInfo.format : 'Supported: .mate, .json'}
              </div>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Info */}
          {fileInfo && !error && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-600">
              <strong>Note:</strong> Imported project will have status reset to 'pending' for all tasks.
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={importing}
              className="flex-1 px-4 py-2 rounded-lg bg-white/50 hover:bg-white/70 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!fileInfo || importing}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? 'Importing...' : 'Import Project'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

