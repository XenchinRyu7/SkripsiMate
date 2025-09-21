import React, { useState } from 'react'
import { Button } from './ui/button'
import { ChevronDown, Folder, Check } from 'lucide-react'
import { Project } from '../contexts/ProjectContext'

interface ProjectDropdownProps {
  projects: Project[]
  currentProject: Project | null
  onSelectProject: (project: Project) => void
  onCreateNew: () => void
}

export default function ProjectDropdown({ 
  projects, 
  currentProject, 
  onSelectProject, 
  onCreateNew 
}: ProjectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelectProject = (project: Project) => {
    onSelectProject(project)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 min-w-[200px] justify-between"
      >
        <div className="flex items-center space-x-2">
          <Folder className="h-4 w-4" />
          <span className="truncate">
            {currentProject ? currentProject.name : 'Select Project'}
          </span>
        </div>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 mt-1 w-full bg-background border border-border rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
            {projects.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground text-center">
                No projects found
              </div>
            ) : (
              projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleSelectProject(project)}
                  className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground flex items-center justify-between group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{project.name}</div>
                    {project.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {project.description}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Updated: {new Date(project.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  {currentProject?.id === project.id && (
                    <Check className="h-4 w-4 text-primary ml-2" />
                  )}
                </button>
              ))
            )}
            
            {/* Create New Project Button */}
            <div className="border-t border-border">
              <button
                onClick={() => {
                  onCreateNew()
                  setIsOpen(false)
                }}
                className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground flex items-center space-x-2"
              >
                <Folder className="h-4 w-4" />
                <span>Create New Project</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
