import React, { createContext, useContext, useState, useEffect } from 'react'

interface Settings {
  geminiApiKey: string
  geminiModel: string
  autoSave: boolean
  theme: 'light' | 'dark' | 'system'
}

interface SettingsContextType {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
  isApiKeyValid: boolean
}

const defaultSettings: Settings = {
  geminiApiKey: '',
  geminiModel: 'gemini-1.5-flash',
  autoSave: true,
  theme: 'system'
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('skripsimate-settings')
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings
  })

  const [isApiKeyValid, setIsApiKeyValid] = useState(false)

  useEffect(() => {
    localStorage.setItem('skripsimate-settings', JSON.stringify(settings))
    
    // Validate API key format (basic validation)
    setIsApiKeyValid(settings.geminiApiKey.length > 0 && settings.geminiApiKey.startsWith('AI'))
  }, [settings])

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isApiKeyValid }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
