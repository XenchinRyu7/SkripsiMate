import React, { createContext, useContext, useState, useEffect } from 'react'

export interface ThesisStep {
  id: string
  title: string
  description: string
  order: number
  completed: boolean
  notes?: string
  dependencies?: string[]
  estimatedTime?: string
  priority: 'low' | 'medium' | 'high'
  type: 'chapter' | 'substep'
  parentId?: string
  level: number
  children?: ThesisStep[]
  position?: { x: number; y: number }
}

export interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  steps: ThesisStep[]
  notes: string
  prompt: string
}

interface AddStepData extends Omit<ThesisStep, 'id'> {
  id?: string
}

interface ProjectContextType {
  currentProject: Project | null
  projects: Project[]
  createNewProject: (name: string, description: string) => void
  selectProject: (project: Project) => void
  updateProject: (updates: Partial<Project>) => void
  addStep: (step: AddStepData) => void
  updateStep: (stepId: string, updates: Partial<ThesisStep>) => void
  deleteStep: (stepId: string) => void
  reorderSteps: (stepIds: string[]) => void
  saveProject: () => Promise<void>
  loadProject: (projectData: Project) => void
  exportProject: (format: 'json' | 'markdown' | 'pdf') => Promise<void>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    // Load projects from localStorage
    const savedProjects = localStorage.getItem('skripsimate-projects')
    const savedCurrentProject = localStorage.getItem('skripsimate-current-project')
    
    if (savedProjects) {
      try {
        const projectsList = JSON.parse(savedProjects)
        setProjects(projectsList)
        
        // Load current project
        if (savedCurrentProject) {
          const current = JSON.parse(savedCurrentProject)
          setCurrentProject(current)
        } else if (projectsList.length > 0) {
          // Set first project as current if no current project is saved
          setCurrentProject(projectsList[0])
        }
      } catch (error) {
        console.error('Failed to load saved projects:', error)
        // Create a default project if loading fails
        const defaultProject: Project = {
          id: Date.now().toString(),
          name: 'New Project',
          description: 'A new thesis project',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          steps: [],
          notes: '',
          prompt: ''
        }
        setProjects([defaultProject])
        setCurrentProject(defaultProject)
      }
    } else {
      // Create a default project if none exists
      const defaultProject: Project = {
        id: Date.now().toString(),
        name: 'New Project',
        description: 'A new thesis project',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: [],
        notes: '',
        prompt: ''
      }
      setProjects([defaultProject])
      setCurrentProject(defaultProject)
    }
  }, [])

  useEffect(() => {
    // Auto-save projects and current project
    if (projects.length > 0) {
      localStorage.setItem('skripsimate-projects', JSON.stringify(projects))
    }
    if (currentProject) {
      localStorage.setItem('skripsimate-current-project', JSON.stringify(currentProject))
    }
  }, [projects, currentProject])

  const createNewProject = (name: string, description: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: [],
      notes: '',
      prompt: ''
    }
    setProjects(prev => [...prev, newProject])
    setCurrentProject(newProject)
  }

  const selectProject = (project: Project) => {
    setCurrentProject(project)
  }

  const updateProject = (updates: Partial<Project>) => {
    if (currentProject) {
      const updatedProject = {
        ...currentProject,
        ...updates,
        updatedAt: new Date().toISOString()
      }
      setCurrentProject(updatedProject)
      
      // Update in projects list
      setProjects(prev => 
        prev.map(project => 
          project.id === currentProject.id ? updatedProject : project
        )
      )
    }
  }

  const addStep = (stepData: AddStepData) => {
    if (currentProject) {
      const newStep: ThesisStep = {
        ...stepData,
        id: stepData.id || Date.now().toString()
      }
      console.log('Adding step to project:', newStep)
      console.log('Current steps before adding:', currentProject.steps.length)
      
      setCurrentProject(prevProject => {
        if (!prevProject) return prevProject
        
        const updatedProject = {
          ...prevProject,
          steps: [...prevProject.steps, newStep],
          updatedAt: new Date().toISOString()
        }
        
        console.log('Updated steps count:', updatedProject.steps.length)
        return updatedProject
      })
    }
  }

  const updateStep = (stepId: string, updates: Partial<ThesisStep>) => {
    if (currentProject) {
      setCurrentProject({
        ...currentProject,
        steps: currentProject.steps.map(step =>
          step.id === stepId ? { ...step, ...updates } : step
        ),
        updatedAt: new Date().toISOString()
      })
    }
  }

  const deleteStep = (stepId: string) => {
    if (currentProject) {
      setCurrentProject({
        ...currentProject,
        steps: currentProject.steps.filter(step => step.id !== stepId),
        updatedAt: new Date().toISOString()
      })
    }
  }

  const reorderSteps = (stepIds: string[]) => {
    if (currentProject) {
      const reorderedSteps = stepIds
        .map(id => currentProject.steps.find(step => step.id === id))
        .filter(Boolean) as ThesisStep[]
      
      setCurrentProject({
        ...currentProject,
        steps: reorderedSteps,
        updatedAt: new Date().toISOString()
      })
    }
  }

  const saveProject = async () => {
    if (!currentProject) return

    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.showSaveDialog({
          filters: [
            { name: 'SkripsiMate Projects', extensions: ['json'] }
          ],
          defaultPath: `${currentProject.name}.json`
        })

        if (!result.canceled && result.filePath) {
          // In a real implementation, you would use Node.js fs to write the file
          // For now, we'll just show a success message
          console.log('Project saved to:', result.filePath)
        }
      }
    } catch (error) {
      console.error('Failed to save project:', error)
    }
  }

  const loadProject = (projectData: Project) => {
    setCurrentProject(projectData)
  }

  const exportProject = async (format: 'json' | 'markdown' | 'pdf') => {
    if (!currentProject) return

    try {
      if (window.electronAPI) {
        const extensions = {
          json: 'json',
          markdown: 'md',
          pdf: 'pdf'
        }

        const result = await window.electronAPI.showSaveDialog({
          filters: [
            { name: `${format.toUpperCase()} Files`, extensions: [extensions[format]] }
          ],
          defaultPath: `${currentProject.name}.${extensions[format]}`
        })

        if (!result.canceled && result.filePath) {
          // In a real implementation, you would generate and save the file
          console.log(`Project exported to ${format}:`, result.filePath)
        }
      }
    } catch (error) {
      console.error(`Failed to export project as ${format}:`, error)
    }
  }

  return (
    <ProjectContext.Provider value={{
      currentProject,
      projects,
      createNewProject,
      selectProject,
      updateProject,
      addStep,
      updateStep,
      deleteStep,
      reorderSteps,
      saveProject,
      loadProject,
      exportProject
    }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}
