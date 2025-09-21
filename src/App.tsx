import { useState, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ThemeProvider } from './contexts/ThemeContext'
import { ProjectProvider, useProject } from './contexts/ProjectContext'
import { SettingsProvider } from './contexts/SettingsContext'
import PromptInput from './components/PromptInput'
import FlowVisualizer from './components/FlowVisualizer'
import NotesPanel from './components/NotesPanel'
import SettingsDialog from './components/SettingsDialog'
import NewProjectDialog from './components/NewProjectDialog'
import ProjectDropdown from './components/ProjectDropdown'
import ExportDropdown from './components/ExportDropdown'
import { Toaster } from './components/ui/toaster'
import { Button } from './components/ui/button'
import { Settings, Save, FolderOpen, Plus } from 'lucide-react'

function AppContent() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false)
  const { currentProject, projects, createNewProject, selectProject, saveProject, exportProject } = useProject()

  useEffect(() => {
    // Set up Electron menu event listeners
    if (window.electronAPI) {
      window.electronAPI.onMenuOpenSettings(() => {
        setIsSettingsOpen(true)
      })
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('menu-open-settings')
      }
    }
  }, [])

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen bg-background text-foreground relative">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold">SkripsiMate</h1>
            <ProjectDropdown 
              projects={projects}
              currentProject={currentProject}
              onSelectProject={selectProject}
              onCreateNew={() => setIsNewProjectDialogOpen(true)}
            />
          </div>

          <div className="flex items-center space-x-2">
            {/* File Operations */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsNewProjectDialogOpen(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Open project dialog
                if (window.electronAPI) {
                  window.electronAPI.showOpenDialog({
                    properties: ['openFile'],
                    filters: [
                      { name: 'SkripsiMate Projects', extensions: ['json'] },
                      { name: 'All Files', extensions: ['*'] }
                    ]
                  }).then((result: any) => {
                    if (!result.canceled && result.filePaths.length > 0) {
                      // Load project logic here
                      console.log('Open project:', result.filePaths[0])
                    }
                  })
                }
              }}
              className="flex items-center space-x-2"
            >
              <FolderOpen className="h-4 w-4" />
              <span>Open</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => saveProject()}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </Button>
            
            {/* Export Dropdown */}
            <ExportDropdown onExport={exportProject} />
            
            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Button>
          </div>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-border">
              <PromptInput />
            </div>
            
            <div className="flex-1 p-4">
              <FlowVisualizer />
            </div>
          </div>
          
          {/* Notes Panel */}
          <div className="w-80 border-l border-border">
            <NotesPanel />
          </div>
        </div>
      </div>
      
      <SettingsDialog 
        open={isSettingsOpen} 
        onOpenChange={setIsSettingsOpen} 
      />
      <NewProjectDialog
        open={isNewProjectDialogOpen}
        onOpenChange={setIsNewProjectDialogOpen}
        onCreateProject={createNewProject}
      />
      <Toaster />
    </DndProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <ProjectProvider>
          <AppContent />
        </ProjectProvider>
      </SettingsProvider>
    </ThemeProvider>
  )
}

export default App
