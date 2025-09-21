import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { 
  Key, 
  Settings as SettingsIcon, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useToast } from '@/hooks/use-toast'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { settings, updateSettings, isApiKeyValid } = useSettings()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  
  const [apiKey, setApiKey] = useState(settings.geminiApiKey)
  const [geminiModel, setGeminiModel] = useState(settings.geminiModel)
  const [showApiKey, setShowApiKey] = useState(false)
  const [autoSave, setAutoSave] = useState(settings.autoSave)

  const handleSave = () => {
    updateSettings({
      geminiApiKey: apiKey,
      geminiModel,
      autoSave,
      theme
    })
    
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully"
    })
    
    onOpenChange(false)
  }

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key first",
        variant: "destructive"
      })
      return
    }

    try {
      // Test the API key with a simple request
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: "Hello"
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 200,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH", 
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          }),
        }
      )

      if (response.ok) {
        toast({
          title: "Success",
          description: "API key is valid and working"
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'API key test failed')
      }
    } catch (error) {
      toast({
        title: "API Key Test Failed",
        description: error instanceof Error ? error.message : "Invalid API key",
        variant: "destructive"
      })
    }
  }

  const getApiKeyStatus = () => {
    if (!apiKey.trim()) {
      return { status: 'empty', icon: AlertCircle, color: 'text-muted-foreground' }
    }
    if (isApiKeyValid) {
      return { status: 'valid', icon: CheckCircle2, color: 'text-green-500' }
    }
    return { status: 'invalid', icon: AlertCircle, color: 'text-destructive' }
  }

  const apiKeyStatus = getApiKeyStatus()
  const StatusIcon = apiKeyStatus.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5" />
            <span>Settings</span>
          </DialogTitle>
          <DialogDescription>
            Configure your SkripsiMate preferences and API settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* API Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <Key className="h-4 w-4" />
                <span>Gemini API Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Input
                      id="api-key"
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your Gemini API key"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleTestApiKey}
                    disabled={!apiKey.trim()}
                  >
                    Test
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <StatusIcon className={`h-4 w-4 ${apiKeyStatus.color}`} />
                  <span className="text-sm text-muted-foreground">
                    {apiKeyStatus.status === 'empty' && 'No API key provided'}
                    {apiKeyStatus.status === 'valid' && 'API key is valid'}
                    {apiKeyStatus.status === 'invalid' && 'API key format is invalid'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model-select">Gemini Model</Label>
                <select
                  id="model-select"
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast & Efficient)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Advanced Reasoning)</option>
                  <option value="gemini-1.0-pro">Gemini 1.0 Pro (Legacy)</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Flash: Faster responses, good for planning. Pro: More advanced reasoning, slower but more detailed.
                </p>
              </div>

              <div className="p-3 bg-muted/50 border border-border rounded-md">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>How to get your Gemini API key:</strong>
                </p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Visit the Google AI Studio</li>
                  <li>Sign in with your Google account</li>
                  <li>Create a new API key (free tier available)</li>
                  <li>Copy and paste it here</li>
                </ol>
                <p className="text-xs text-muted-foreground mt-2">
                  <strong>Note:</strong> Choose the model that best fits your needs. Flash is recommended for most users.
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto mt-2"
                  onClick={() => {
                    // Use Electron's shell to open in user's default browser
                    if (window.electronAPI) {
                      // This will be handled by Electron's shell.openExternal
                      window.electronAPI.openExternal('https://makersuite.google.com/app/apikey')
                    } else {
                      // Fallback for web version
                      window.location.href = 'https://makersuite.google.com/app/apikey'
                    }
                  }}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open Google AI Studio
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-save projects</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save your project changes
                  </p>
                </div>
                <Switch
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
              </div>

              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex space-x-2">
                  {[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'system', label: 'System' }
                  ].map((themeOption) => (
                    <Button
                      key={themeOption.value}
                      variant={theme === themeOption.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme(themeOption.value as 'light' | 'dark' | 'system')}
                    >
                      {themeOption.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* App Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About SkripsiMate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Version</span>
                <Badge variant="outline">1.0.0</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Build</span>
                <span className="text-sm font-mono">Electron + React</span>
              </div>

              <div className="p-3 bg-muted/50 border border-border rounded-md">
                <p className="text-sm text-muted-foreground">
                  SkripsiMate is a modern desktop application for thesis planning with AI assistance. 
                  It helps you structure your research, generate step-by-step plans, and track your progress.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
