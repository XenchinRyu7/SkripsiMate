// Export Modal Component
'use client';

import { useState } from 'react';
import { Project, Node as DBNode } from '@/lib/supabase';

interface ExportModalProps {
  project: Project;
  nodes: DBNode[];
  onClose: () => void;
}

export default function ExportModal({ project, nodes, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<'json' | 'markdown' | 'mate'>('mate');
  const [exported, setExported] = useState(false);

  const exportAsJSON = () => {
    const exportData = {
      project: {
        title: project.title,
        jurusan: project.jurusan,
        timeline: project.timeline,
        description: project.description,
        metadata: project.metadata,
      },
      nodes: nodes.map(node => ({
        id: node.id,
        title: node.title,
        description: node.description,
        type: node.type,
        level: node.level,
        parent_id: node.parent_id,
        status: node.status,
        priority: node.priority,
        position: node.position,
        metadata: node.metadata,
      })),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '-')}-roadmap.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExported(true);
  };

  const exportAsMarkdown = () => {
    let markdown = `# ${project.title}\n\n`;
    markdown += `**Jurusan:** ${project.jurusan}  \n`;
    markdown += `**Timeline:** ${project.timeline}  \n`;
    markdown += `**Progress:** ${(project.metadata as any)?.progressPercentage || 0}%  \n\n`;

    if (project.description) {
      markdown += `## Description\n\n${project.description}\n\n`;
    }

    markdown += `## Roadmap\n\n`;

    // Group by phases
    const phases = nodes.filter(n => n.type === 'phase').sort((a, b) => a.order_index - b.order_index);

    phases.forEach((phase, phaseIndex) => {
      const phaseMetadata = phase.metadata as any;
      markdown += `### ${phaseIndex + 1}. ${phase.title}\n\n`;
      if (phase.description) {
        markdown += `${phase.description}\n\n`;
      }
      markdown += `**Phase Progress:** ${phaseMetadata?.progress || 0}%  \n`;
      markdown += `**Status:** ${phase.status}  \n\n`;

      // Get steps for this phase
      const steps = nodes.filter(n => n.type === 'step' && n.parent_id === phase.id)
        .sort((a, b) => a.order_index - b.order_index);

      steps.forEach((step, stepIndex) => {
        const statusEmoji = step.status === 'completed' ? '✅' : step.status === 'in_progress' ? '🔄' : '⏸️';
        markdown += `#### ${phaseIndex + 1}.${stepIndex + 1} ${statusEmoji} ${step.title}\n\n`;
        if (step.description) {
          markdown += `${step.description}\n\n`;
        }

        // Get substeps
        const substeps = nodes.filter(n => n.type === 'substep' && n.parent_id === step.id)
          .sort((a, b) => a.order_index - b.order_index);

        if (substeps.length > 0) {
          markdown += `**Subtasks (${substeps.length}):**\n\n`;
          substeps.forEach((substep, subIndex) => {
            const subStatusEmoji = substep.status === 'completed' ? '✅' : '⬜';
            markdown += `  ${subIndex + 1}. ${subStatusEmoji} ${substep.title}\n`;
            if (substep.description) {
              markdown += `     ${substep.description}\n`;
            }
          });
          markdown += `\n`;
        }

        const metadata = step.metadata as any;
        if (metadata?.estimatedTime) {
          markdown += `**Estimated Time:** ${metadata.estimatedTime}  \n`;
        }
        if (step.priority) {
          markdown += `**Priority:** ${step.priority.toUpperCase()}  \n`;
        }
        markdown += `\n`;
      });
    });

    markdown += `---\n\n*Exported from SkripsiMate on ${new Date().toLocaleString()}*\n`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '-')}-roadmap.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExported(true);
  };

  const exportAsMATE = () => {
    // SkripsiMate Custom Format (.mate or .sm)
    const metadata = project.metadata as any;
    const phases = nodes.filter(n => n.type === 'phase').sort((a, b) => a.order_index - b.order_index);
    
    const mateData = {
      format: 'SkripsiMate',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      project: {
        id: project.id,
        title: project.title,
        jurusan: project.jurusan,
        timeline: project.timeline,
        description: project.description,
        progress: metadata?.progressPercentage || 0,
        currentPhase: metadata?.currentPhase || 'N/A',
        totalSteps: metadata?.totalSteps || 0,
        completedSteps: metadata?.completedSteps || 0,
        createdAt: project.created_at,
        lastModified: project.updated_at,
      },
      roadmap: phases.map((phase, phaseIndex) => {
        const phaseMetadata = phase.metadata as any;
        const steps = nodes.filter(n => n.type === 'step' && n.parent_id === phase.id)
          .sort((a, b) => a.order_index - b.order_index);

        return {
          phaseNumber: phaseIndex + 1,
          id: phase.id,
          title: phase.title,
          description: phase.description,
          status: phase.status,
          priority: phase.priority,
          progress: phaseMetadata?.progress || 0,
          estimatedTime: phaseMetadata?.estimatedTime || null,
          steps: steps.map((step, stepIndex) => {
            const stepMetadata = step.metadata as any;
            const substeps = nodes.filter(n => n.type === 'substep' && n.parent_id === step.id)
              .sort((a, b) => a.order_index - b.order_index);

            return {
              stepNumber: `${phaseIndex + 1}.${stepIndex + 1}`,
              id: step.id,
              title: step.title,
              description: step.description,
              status: step.status,
              priority: step.priority,
              estimatedTime: stepMetadata?.estimatedTime || null,
              dependencies: stepMetadata?.dependencies || [],
              substeps: substeps.map((substep, subIndex) => ({
                substepNumber: `${phaseIndex + 1}.${stepIndex + 1}.${subIndex + 1}`,
                id: substep.id,
                title: substep.title,
                description: substep.description,
                status: substep.status,
                priority: substep.priority,
              })),
            };
          }),
        };
      }),
      statistics: {
        totalPhases: phases.length,
        totalSteps: nodes.filter(n => n.type === 'step').length,
        totalSubsteps: nodes.filter(n => n.type === 'substep').length,
        completedPhases: phases.filter(p => p.status === 'completed').length,
        completedSteps: nodes.filter(n => n.type === 'step' && n.status === 'completed').length,
        completedSubsteps: nodes.filter(n => n.type === 'substep' && n.status === 'completed').length,
      },
    };

    const blob = new Blob([JSON.stringify(mateData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '-')}-roadmap.mate`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExported(true);
  };

  const handleExport = () => {
    if (format === 'json') {
      exportAsJSON();
    } else if (format === 'markdown') {
      exportAsMarkdown();
    } else {
      exportAsMATE();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">📥 Export Project</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {!exported ? (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Export your thesis roadmap to share or backup your progress.
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Export Format
                </label>

                <div className="space-y-2">
                  <label className="flex items-center p-3 glass rounded-lg cursor-pointer hover:bg-white/80 transition-colors border-2 border-blue-500">
                    <input
                      type="radio"
                      name="format"
                      value="mate"
                      checked={format === 'mate'}
                      onChange={(e) => setFormat(e.target.value as any)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                        SkripsiMate (.mate) <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">Recommended</span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Complete hierarchy: Phases → Steps → Substeps with all metadata & progress
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center p-3 glass rounded-lg cursor-pointer hover:bg-white/80 transition-colors">
                    <input
                      type="radio"
                      name="format"
                      value="markdown"
                      checked={format === 'markdown'}
                      onChange={(e) => setFormat(e.target.value as any)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">Markdown (.md)</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Human-readable format for sharing & documentation
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center p-3 glass rounded-lg cursor-pointer hover:bg-white/80 transition-colors">
                    <input
                      type="radio"
                      name="format"
                      value="json"
                      checked={format === 'json'}
                      onChange={(e) => setFormat(e.target.value as any)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">JSON (.json)</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Raw data format for backup & data processing
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/50 hover:bg-white/70 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                >
                  Export .{format === 'mate' ? 'mate' : format === 'markdown' ? 'md' : 'json'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              Export Successful!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Your file has been downloaded.
            </p>
            <div className="glass-card p-4 mb-6 text-left">
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Exported Content:</div>
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <div>📅 {nodes.filter(n => n.type === 'phase').length} Phases</div>
                <div>📝 {nodes.filter(n => n.type === 'step').length} Steps</div>
                <div>✓ {nodes.filter(n => n.type === 'substep').length} Substeps</div>
                <div className="pt-2 border-t border-gray-300">
                  <strong>Total: {nodes.length} nodes</strong>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

