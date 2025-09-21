import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  GripVertical,
  Edit,
  Trash2,
  Plus,
  BookOpen,
  FileText,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Grid3X3
} from 'lucide-react'
import { useProject, ThesisStep } from '@/contexts/ProjectContext'
import { cn } from '@/lib/utils'

interface CanvasPosition {
  x: number
  y: number
}

interface StepWithPosition extends ThesisStep {
  position: CanvasPosition
}

interface FreeformCanvasProps {
  steps: ThesisStep[]
  onUpdateStep: (stepId: string, updates: Partial<ThesisStep>) => void
  onDeleteStep: (stepId: string) => void
  onAddStep: () => void
}

export default function FreeformCanvas({ 
  steps, 
  onUpdateStep, 
  onDeleteStep, 
  onAddStep 
}: FreeformCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(true)
  const [editingStep, setEditingStep] = useState<ThesisStep | null>(null)

  // Convert steps to include positions (default positions if not set)
  const stepsWithPositions: StepWithPosition[] = steps.map((step, index) => ({
    ...step,
    position: (step as any).position || {
      x: 50 + (index % 3) * 300,
      y: 50 + Math.floor(index / 3) * 200
    }
  }))

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)))
  }, [])

  // Handle mouse down for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.metaKey)) { // Middle mouse or Cmd+click
      setIsPanning(true)
      setLastPanPoint({ x: e.clientX, y: e.clientY })
    }
  }, [])

  // Handle mouse move for panning
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x
      const deltaY = e.clientY - lastPanPoint.y
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))
      setLastPanPoint({ x: e.clientX, y: e.clientY })
    }
  }, [isPanning, lastPanPoint])

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  // Handle zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(3, prev * 1.2))
  const handleZoomOut = () => setZoom(prev => Math.max(0.1, prev / 1.2))
  const handleResetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  // Update step position
  const updateStepPosition = (stepId: string, position: CanvasPosition) => {
    onUpdateStep(stepId, { position })
  }

  // Handle step drag
  const handleStepDrag = (stepId: string, deltaX: number, deltaY: number) => {
    const step = stepsWithPositions.find(s => s.id === stepId)
    if (step) {
      const newPosition = {
        x: step.position.x + deltaX / zoom,
        y: step.position.y + deltaY / zoom
      }
      updateStepPosition(stepId, newPosition)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Canvas Controls */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 0.1}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetView}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={showGrid ? "default" : "outline"}
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddStep}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden bg-background cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      >
        {/* Grid Background */}
        {showGrid && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
              `,
              backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
              transform: `translate(${pan.x}px, ${pan.y}px)`
            }}
          />
        )}

        {/* Canvas Content */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        >
          {/* Steps */}
          {stepsWithPositions.map((step) => (
            <DraggableStepCard
              key={step.id}
              step={step}
              onUpdate={onUpdateStep}
              onDelete={onDeleteStep}
              onEdit={setEditingStep}
              onDrag={handleStepDrag}
            />
          ))}

          {/* Empty State */}
          {steps.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No Steps Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first step to start planning your thesis.
                  </p>
                  <Button onClick={onAddStep}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Step Dialog */}
      {editingStep && (
        <EditStepDialog
          step={editingStep}
          onClose={() => setEditingStep(null)}
          onSave={(updatedStep) => {
            onUpdateStep(editingStep.id, updatedStep)
            setEditingStep(null)
          }}
        />
      )}
    </div>
  )
}

// Draggable Step Card Component
function DraggableStepCard({
  step,
  onUpdate,
  onDelete,
  onEdit,
  onDrag
}: {
  step: StepWithPosition
  onUpdate: (stepId: string, updates: Partial<ThesisStep>) => void
  onDelete: (stepId: string) => void
  onEdit: (step: ThesisStep) => void
  onDrag: (stepId: string, deltaX: number, deltaY: number) => void
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const [{ isDragging: isDndDragging }, drag] = useDrag({
    type: 'step',
    item: { id: step.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
      e.preventDefault()
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      onDrag(step.id, deltaX, deltaY)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleToggleComplete = () => {
    onUpdate(step.id, { completed: !step.completed })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive text-destructive-foreground'
      case 'medium':
        return 'bg-yellow-500 text-yellow-foreground'
      case 'low':
        return 'bg-green-500 text-green-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const isChapter = step.type === 'chapter'

  return (
    <div
      ref={(node) => drag(node)}
      className={cn(
        "absolute w-80 cursor-move select-none",
        isDndDragging && "opacity-50"
      )}
      style={{
        left: step.position.x,
        top: step.position.y,
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        transition: isDragging ? 'none' : 'transform 0.2s ease'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <Card className={cn(
        "w-full transition-all duration-200 hover:shadow-lg",
        step.completed && "opacity-75 bg-muted/50",
        isChapter && "border-l-4 border-l-primary shadow-md",
        isDragging && "shadow-xl"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleToggleComplete}
                  className="transition-colors hover:text-primary"
                >
                  {step.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    {step.order}
                  </span>
                  <Badge variant="outline" className={getPriorityColor(step.priority)}>
                    {step.priority}
                  </Badge>
                  {isChapter && (
                    <Badge variant="secondary" className="text-xs">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Chapter
                    </Badge>
                  )}
                  {step.type === 'substep' && (
                    <Badge variant="outline" className="text-xs">
                      <FileText className="h-3 w-3 mr-1" />
                      Step
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(step)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(step.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <CardTitle className={cn(
            "text-base leading-tight",
            step.completed && "line-through text-muted-foreground"
          )}>
            {step.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0">
          <p className={cn(
            "text-sm text-muted-foreground mb-3",
            step.completed && "line-through"
          )}>
            {step.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {step.estimatedTime && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{step.estimatedTime}</span>
                </div>
              )}
              
              {step.dependencies && step.dependencies.length > 0 && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <AlertCircle className="h-3 w-3" />
                  <span>{step.dependencies.length} dependencies</span>
                </div>
              )}
            </div>

            {step.notes && (
              <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                Has notes
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Edit Step Dialog Component (reused from FlowVisualizer)
function EditStepDialog({ 
  step, 
  onClose, 
  onSave 
}: { 
  step: ThesisStep
  onClose: () => void
  onSave: (step: Partial<ThesisStep>) => void 
}) {
  const [title, setTitle] = useState(step.title)
  const [description, setDescription] = useState(step.description)
  const [priority, setPriority] = useState(step.priority)
  const [estimatedTime, setEstimatedTime] = useState(step.estimatedTime || '')
  const [notes, setNotes] = useState(step.notes || '')

  const handleSave = () => {
    onSave({
      title,
      description,
      priority,
      estimatedTime: estimatedTime || undefined,
      notes: notes || undefined
    })
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background border border-border rounded-lg p-6 w-96 max-w-[90vw] max-h-[90vh] overflow-auto">
        <h2 className="text-lg font-semibold mb-4">Edit Step</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
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
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
