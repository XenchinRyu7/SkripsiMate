import { useState } from 'react'
import { Button } from './ui/button'
import { Plus } from 'lucide-react'
import { useProject, ThesisStep } from '@/contexts/ProjectContext'
import FreeformCanvas from './FreeformCanvas'


export default function FlowVisualizer() {
  const { currentProject, updateStep, deleteStep, addStep } = useProject()
  const [isAddingStep, setIsAddingStep] = useState(false)

  const handleAddStep = () => {
    setIsAddingStep(true)
  }

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">No Project Selected</h3>
            <p className="text-muted-foreground">
              Create a new project or open an existing one to start planning your thesis.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <FreeformCanvas
        steps={currentProject.steps}
        onUpdateStep={updateStep}
        onDeleteStep={deleteStep}
        onAddStep={handleAddStep}
      />

      {/* Add Step Dialog */}
      {isAddingStep && (
        <AddStepDialog
          onClose={() => setIsAddingStep(false)}
          onSave={(newStep) => {
            addStep({
              ...newStep,
              order: currentProject.steps.length + 1,
              completed: false
            })
            setIsAddingStep(false)
          }}
        />
      )}
    </div>
  )
}


// Add Step Dialog Component
function AddStepDialog({ 
  onClose, 
  onSave 
}: { 
  onClose: () => void
  onSave: (step: Omit<ThesisStep, 'id' | 'order' | 'completed'>) => void 
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [estimatedTime, setEstimatedTime] = useState('')
  const [notes, setNotes] = useState('')

  const handleSave = () => {
    if (!title.trim()) return
    
    onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
      estimatedTime: estimatedTime.trim() || undefined,
      notes: notes.trim() || undefined,
      type: 'substep',
      level: 2
    })
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background border border-border rounded-lg p-6 w-96 max-w-[90vw] max-h-[90vh] overflow-auto">
        <h2 className="text-lg font-semibold mb-4">Add New Step</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter step title"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Enter step description"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Estimated Time</label>
            <input
              type="text"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              placeholder="e.g., 2-3 weeks, 1 month"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Additional notes..."
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            Add Step
          </Button>
        </div>
      </div>
    </div>
  )
}
