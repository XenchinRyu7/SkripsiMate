import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  StickyNote, 
  Save, 
  FileText, 
  Calendar,
  Clock,
  CheckCircle2,
  Circle
} from 'lucide-react'
import { useProject } from '@/contexts/ProjectContext'
import { formatDate } from '@/lib/utils'

export default function NotesPanel() {
  const { currentProject, updateProject } = useProject()
  const [notes, setNotes] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (currentProject) {
      setNotes(currentProject.notes || '')
    }
  }, [currentProject])

  const handleSaveNotes = () => {
    if (currentProject) {
      updateProject({ notes })
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setNotes(currentProject?.notes || '')
    setIsEditing(false)
  }

  const getProjectStats = () => {
    if (!currentProject) return null

    const totalSteps = currentProject.steps.length
    const completedSteps = currentProject.steps.filter(step => step.completed).length
    const highPrioritySteps = currentProject.steps.filter(step => step.priority === 'high').length
    const stepsWithTimeEstimate = currentProject.steps.filter(step => step.estimatedTime).length

    return {
      totalSteps,
      completedSteps,
      highPrioritySteps,
      stepsWithTimeEstimate,
      completionRate: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
    }
  }

  const stats = getProjectStats()

  if (!currentProject) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
            <StickyNote className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">No Project</h3>
            <p className="text-xs text-muted-foreground">
              Create or open a project to view notes and statistics.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      {/* Project Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Project Info</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h3 className="font-medium text-sm">{currentProject.name}</h3>
            {currentProject.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {currentProject.description}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Created</span>
              <span className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(currentProject.createdAt)}</span>
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Updated</span>
              <span className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatDate(currentProject.updatedAt)}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Statistics */}
      {stats && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-lg font-semibold">{stats.totalSteps}</div>
                <div className="text-xs text-muted-foreground">Total Steps</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">{stats.completedSteps}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Progress</span>
                <span className="text-xs font-medium">{stats.completionRate}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">
                {stats.highPrioritySteps} High Priority
              </Badge>
              <Badge variant="outline" className="text-xs">
                {stats.stepsWithTimeEstimate} With Time
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes Section */}
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center space-x-2">
              <StickyNote className="h-4 w-4" />
              <span>Notes</span>
            </CardTitle>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-6 px-2 text-xs"
              >
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {isEditing ? (
            <div className="flex-1 flex flex-col space-y-3">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your notes, thoughts, or reminders about this project..."
                className="flex-1 resize-none"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  className="flex items-center space-x-1"
                >
                  <Save className="h-3 w-3" />
                  <span>Save</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              {notes ? (
                <div className="text-sm whitespace-pre-wrap text-foreground">
                  {notes}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Circle className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      No notes yet. Click Edit to add some.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  // Mark all steps as completed
                  currentProject.steps.forEach(step => {
                    if (!step.completed) {
                      // This would need to be implemented in the context
                    }
                  })
                }}
              >
                Mark All Done
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  // Clear all completed steps
                  currentProject.steps.forEach(step => {
                    if (step.completed) {
                      // This would need to be implemented in the context
                    }
                  })
                }}
              >
                Clear Completed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
