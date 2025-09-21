import React, { useState } from 'react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Send, Sparkles, Loader2 } from 'lucide-react'
import { useProject } from '@/contexts/ProjectContext'
import { useSettings } from '@/contexts/SettingsContext'
import { useToast } from '@/hooks/use-toast'
import { generateThesisSteps } from '@/lib/gemini'

export default function PromptInput() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const { currentProject, updateProject, addStep } = useProject()
  const { settings, isApiKeyValid } = useSettings()
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive"
      })
      return
    }

    if (!isApiKeyValid) {
      toast({
        title: "API Key Required",
        description: "Please configure your Gemini API key in Settings",
        variant: "destructive"
      })
      return
    }

    if (!currentProject) {
      toast({
        title: "No Project",
        description: "Please create a project first",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)

    try {
      // Update project with the prompt
      updateProject({ prompt: prompt.trim() })

      // Generate thesis steps using Gemini API
      const steps = await generateThesisSteps(prompt.trim(), settings.geminiApiKey, settings.geminiModel)

      // Clear existing steps and add new ones
      // Note: In a real implementation, you'd clear existing steps first

      // Add generated steps with hierarchical structure
      const processSteps = async (stepData: any, parentId?: string, level: number = 1) => {
        const stepId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
        
        console.log(`Processing step: ${stepData.title} (level ${level}, parentId: ${parentId}, stepId: ${stepId})`)
        
        const stepToAdd = {
          id: stepId,
          title: stepData.title,
          description: stepData.description,
          order: stepData.order,
          priority: stepData.priority,
          estimatedTime: stepData.estimatedTime,
          dependencies: stepData.dependencies,
          type: stepData.type || (level === 1 ? 'chapter' : 'substep'),
          parentId: parentId,
          level: level,
          completed: false
        }
        
        console.log('Adding step with type:', stepToAdd.type, 'level:', stepToAdd.level, 'title:', stepToAdd.title)
        addStep(stepToAdd)

        // Process substeps if they exist
        if (stepData.substeps && Array.isArray(stepData.substeps)) {
          console.log(`Processing ${stepData.substeps.length} substeps for ${stepData.title}`)
          for (const [subIndex, substep] of stepData.substeps.entries()) {
            await processSteps({
              ...substep,
              order: subIndex + 1,
              type: 'substep',
              level: level + 1
            }, stepId, level + 1)
            // Small delay for substeps too
            await new Promise(resolve => setTimeout(resolve, 5))
          }
        }
      }

      // Add steps one by one to ensure proper state updates
      for (const stepData of steps) {
        await processSteps(stepData)
        // Small delay to ensure state updates properly
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      // Wait a bit for state to update, then show success message
      setTimeout(() => {
        const updatedProject = JSON.parse(localStorage.getItem('skripsimate-current-project') || '{}')
        const totalSteps = updatedProject.steps?.length || 0
        const chapterCount = updatedProject.steps?.filter((s: any) => s.type === 'chapter').length || 0
        const substepCount = updatedProject.steps?.filter((s: any) => s.type === 'substep').length || 0
        
        toast({
          title: "Success",
          description: `Generated ${chapterCount} chapters with ${substepCount} substeps (${totalSteps} total steps)`
        })
      }, 100)

      // Clear the prompt
      setPrompt('')
    } catch (error) {
      console.error('Error generating thesis steps:', error)
      
      let errorMessage = "Failed to generate thesis steps"
      if (error instanceof Error) {
        if (error.message.includes('JSON')) {
          errorMessage = "AI response format error. Please try again with a different prompt."
        } else if (error.message.includes('API key')) {
          errorMessage = "API key error. Please check your Gemini API key in Settings."
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
          errorMessage = "API quota exceeded. Please try again later or check your API limits."
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleGenerate()
    }
  }

  const examplePrompts = [
    "Create a thesis plan for developing a machine learning model to predict stock prices",
    "Plan a research thesis on the impact of social media on mental health in teenagers",
    "Design a thesis structure for studying renewable energy adoption in developing countries",
    "Outline a thesis on the effectiveness of online learning platforms during COVID-19"
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5" />
            <span>AI Thesis Planner</span>
          </div>
          <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
            {settings.geminiModel.replace('gemini-', '').replace('-', ' ').toUpperCase()}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            placeholder="Describe your thesis topic, research questions, or what you want to study. The AI will generate a comprehensive hierarchical plan with chapters and detailed substeps, timelines, and priorities."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[120px] resize-none"
            disabled={isGenerating}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Press Ctrl+Enter to generate steps
          </p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setPrompt(example)}
                disabled={isGenerating}
                className="text-xs"
              >
                {example.substring(0, 50)}...
              </Button>
            ))}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || !isApiKeyValid || isGenerating}
            className="flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Generate Steps</span>
              </>
            )}
          </Button>
        </div>

        {!isApiKeyValid && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">
              ⚠️ Please configure your Gemini API key in Settings to use the AI features.
            </p>
          </div>
        )}

        {currentProject?.prompt && (
          <div className="p-3 bg-muted/50 border border-border rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Current prompt:</strong> {currentProject.prompt}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
