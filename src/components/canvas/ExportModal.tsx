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
  const [format, setFormat] = useState<'json' | 'markdown'>('json');
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
      markdown += `### ${phaseIndex + 1}. ${phase.title}\n\n`;
      if (phase.description) {
        markdown += `${phase.description}\n\n`;
      }

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
          markdown += `**Subtasks:**\n\n`;
          substeps.forEach((substep) => {
            const subStatusEmoji = substep.status === 'completed' ? '✅' : '⬜';
            markdown += `- ${subStatusEmoji} ${substep.title}\n`;
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

  const handleExport = () => {
    if (format === 'json') {
      exportAsJSON();
    } else {
      exportAsMarkdown();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">📥 Export Project</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {!exported ? (
          <>
            <p className="text-sm text-gray-600 mb-6">
              Export your thesis roadmap to share or backup your progress.
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Export Format
                </label>

                <div className="space-y-2">
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
                      <div className="font-medium text-gray-900">JSON</div>
                      <div className="text-xs text-gray-600">
                        Machine-readable format for backup & data analysis
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
                      <div className="font-medium text-gray-900">Markdown</div>
                      <div className="text-xs text-gray-600">
                        Human-readable format for sharing & documentation
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/50 hover:bg-white/70 text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                >
                  Export {format.toUpperCase()}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Export Successful!
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Your file has been downloaded.
            </p>
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

