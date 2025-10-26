// Template Modal - Pre-made Project Templates
'use client';

import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface TemplateModalProps {
  onClose: () => void;
  onProjectCreated: () => void;
}

const TEMPLATES = [
  {
    id: 'sistem-informasi',
    title: 'Sistem Informasi',
    icon: '💻',
    description: 'Template untuk thesis development aplikasi sistem informasi',
    jurusan: 'Teknik Informatika',
    timeline: '6 months',
    phases: [
      {
        title: 'Phase 1: Analysis & Planning',
        steps: [
          { title: 'Literature Review', description: 'Review existing systems and research papers', time: '2 weeks' },
          { title: 'Requirements Gathering', description: 'Collect functional and non-functional requirements', time: '1 week' },
          { title: 'System Analysis', description: 'Analyze current system and identify gaps', time: '1 week' },
        ],
      },
      {
        title: 'Phase 2: Design',
        steps: [
          { title: 'Database Design', description: 'Design ERD and database schema', time: '1 week' },
          { title: 'System Architecture', description: 'Design system architecture and tech stack', time: '1 week' },
          { title: 'UI/UX Design', description: 'Create wireframes and mockups', time: '2 weeks' },
        ],
      },
      {
        title: 'Phase 3: Implementation',
        steps: [
          { title: 'Backend Development', description: 'Build APIs and business logic', time: '4 weeks' },
          { title: 'Frontend Development', description: 'Build user interface', time: '4 weeks' },
          { title: 'Integration & Testing', description: 'Integrate components and test', time: '2 weeks' },
        ],
      },
      {
        title: 'Phase 4: Testing & Documentation',
        steps: [
          { title: 'System Testing', description: 'Perform UAT and bug fixes', time: '2 weeks' },
          { title: 'Documentation', description: 'Write thesis documentation', time: '3 weeks' },
          { title: 'Final Presentation', description: 'Prepare slides and practice', time: '1 week' },
        ],
      },
    ],
  },
  {
    id: 'machine-learning',
    title: 'Machine Learning',
    icon: '🤖',
    description: 'Template untuk research AI/ML dan data science',
    jurusan: 'Data Science',
    timeline: '6 months',
    phases: [
      {
        title: 'Phase 1: Problem Definition',
        steps: [
          { title: 'Literature Review', description: 'Review ML papers and sota models', time: '2 weeks' },
          { title: 'Dataset Research', description: 'Find and evaluate datasets', time: '1 week' },
          { title: 'Problem Formulation', description: 'Define research questions and metrics', time: '1 week' },
        ],
      },
      {
        title: 'Phase 2: Data Preparation',
        steps: [
          { title: 'Data Collection', description: 'Gather and consolidate datasets', time: '2 weeks' },
          { title: 'Data Cleaning', description: 'Handle missing values and outliers', time: '1 week' },
          { title: 'Feature Engineering', description: 'Create and select features', time: '2 weeks' },
        ],
      },
      {
        title: 'Phase 3: Model Development',
        steps: [
          { title: 'Baseline Model', description: 'Implement baseline algorithms', time: '1 week' },
          { title: 'Model Training', description: 'Train and tune models', time: '3 weeks' },
          { title: 'Model Evaluation', description: 'Compare models and optimize', time: '2 weeks' },
        ],
      },
      {
        title: 'Phase 4: Deployment & Documentation',
        steps: [
          { title: 'Model Deployment', description: 'Deploy model as API/service', time: '2 weeks' },
          { title: 'Results Analysis', description: 'Analyze and visualize results', time: '2 weeks' },
          { title: 'Thesis Writing', description: 'Write complete thesis document', time: '3 weeks' },
        ],
      },
    ],
  },
  {
    id: 'mobile-app',
    title: 'Mobile Application',
    icon: '📱',
    description: 'Template untuk development mobile app (Android/iOS)',
    jurusan: 'Teknik Informatika',
    timeline: '5 months',
    phases: [
      {
        title: 'Phase 1: Planning & Design',
        steps: [
          { title: 'Market Research', description: 'Research competitors and user needs', time: '1 week' },
          { title: 'Requirements', description: 'Define app features and specifications', time: '1 week' },
          { title: 'UI/UX Design', description: 'Design app screens and flow', time: '2 weeks' },
        ],
      },
      {
        title: 'Phase 2: Development',
        steps: [
          { title: 'Setup Environment', description: 'Setup React Native/Flutter project', time: '3 days' },
          { title: 'Core Features', description: 'Implement main functionalities', time: '4 weeks' },
          { title: 'Backend Integration', description: 'Connect to APIs and services', time: '2 weeks' },
        ],
      },
      {
        title: 'Phase 3: Testing & Polish',
        steps: [
          { title: 'Testing', description: 'Test on multiple devices and OS versions', time: '2 weeks' },
          { title: 'Bug Fixes', description: 'Fix bugs and optimize performance', time: '1 week' },
          { title: 'App Store Prep', description: 'Prepare for app store submission', time: '1 week' },
        ],
      },
      {
        title: 'Phase 4: Documentation',
        steps: [
          { title: 'User Documentation', description: 'Create user guide and help docs', time: '1 week' },
          { title: 'Thesis Writing', description: 'Write thesis document', time: '3 weeks' },
          { title: 'Presentation', description: 'Prepare final presentation', time: '1 week' },
        ],
      },
    ],
  },
];

export default function TemplateModal({ onClose, onProjectCreated }: TemplateModalProps) {
  const { user } = useAuthContext();
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setProjectTitle(`My ${template.title} Project`);
    }
  };

  const handleCreate = async () => {
    if (!user || !selectedTemplate || !projectTitle) return;

    const template = TEMPLATES.find(t => t.id === selectedTemplate);
    if (!template) return;

    setCreating(true);

    try {
      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.uid,
          title: projectTitle,
          jurusan: template.jurusan,
          timeline: template.timeline,
          description: template.description,
          metadata: {
            progressPercentage: 0,
            totalSteps: 0,
            completedSteps: 0,
            currentPhase: template.phases[0].title,
            createdFromTemplate: template.id,
          },
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Create nodes from template with proper parent mapping
      let orderIndex = 0;

      for (const phase of template.phases) {
        // Create phase node
        const { data: phaseNode, error: phaseError } = await supabase
          .from('nodes')
          .insert({
            project_id: project.id,
            title: phase.title,
            description: '',
            type: 'phase',
            level: 1,
            parent_id: null,
            order_index: orderIndex++,
            status: 'pending',
            priority: 'medium',
            position: { x: 100, y: 100 },
            metadata: {
              phaseIndex: template.phases.indexOf(phase),
              progress: 0,
            },
          })
          .select()
          .single();

        if (phaseError) throw phaseError;

        // Create step nodes for this phase
        const stepNodes = phase.steps.map((step, stepIndex) => ({
          project_id: project.id,
          title: step.title,
          description: step.description,
          type: 'step',
          level: 2,
          parent_id: phaseNode.id,
          order_index: orderIndex + stepIndex,
          status: 'pending',
          priority: 'medium',
          position: { x: 100, y: 100 },
          metadata: {
            estimatedTime: step.time,
          },
        }));

        orderIndex += stepNodes.length;

        const { error: stepsError } = await supabase
          .from('nodes')
          .insert(stepNodes);

        if (stepsError) throw stepsError;
      }

      onProjectCreated();
      onClose();
      router.push(`/project/${project.id}`);
    } catch (error) {
      console.error('Failed to create project from template:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const template = selectedTemplate ? TEMPLATES.find(t => t.id === selectedTemplate) : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-2xl rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">📚 Project Templates</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Start with a pre-made template to speed up your thesis project setup.
        </p>

        {!selectedTemplate ? (
          <div className="space-y-3">
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => handleSelectTemplate(tmpl.id)}
                className="w-full text-left p-4 glass rounded-xl hover:bg-white/80 transition-all border-2 border-transparent hover:border-blue-500"
              >
                <div className="flex items-start space-x-3">
                  <div className="text-3xl">{tmpl.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">{tmpl.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{tmpl.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>📚 {tmpl.jurusan}</span>
                      <span>⏱️ {tmpl.timeline}</span>
                      <span>📅 {tmpl.phases.length} phases</span>
                    </div>
                  </div>
                  <div className="text-blue-500">→</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedTemplate(null)}
              className="text-sm text-blue-600 hover:underline"
            >
              ← Back to templates
            </button>

            {/* Template Preview */}
            <div className="glass p-4 rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-3xl">{template?.icon}</div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{template?.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{template?.description}</p>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                {template?.phases.map((phase, idx) => (
                  <details key={idx} className="glass-card p-3 rounded-lg">
                    <summary className="cursor-pointer font-medium text-sm text-gray-900 dark:text-gray-100">
                      {phase.title} ({phase.steps.length} steps)
                    </summary>
                    <ul className="mt-2 ml-4 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                      {phase.steps.map((step, stepIdx) => (
                        <li key={stepIdx}>• {step.title} ({step.time})</li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </div>

            {/* Project Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Title
              </label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="Enter project title"
                className="w-full px-3 py-2 rounded-lg glass border border-gray-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={creating}
                className="flex-1 px-4 py-2 rounded-lg bg-white/50 hover:bg-white/70 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!projectTitle.trim() || creating}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create from Template'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

