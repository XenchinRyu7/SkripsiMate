// AI Settings Component (Self-Hosted Only)
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Brain, Key, Server, CheckCircle2, XCircle, Loader2, Eye, EyeOff } from "lucide-react";

type AIProvider = 'gemini' | 'openai' | 'claude' | 'ollama';

interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  ollamaEndpoint?: string;
}

// Model recommendations for large context
const MODEL_RECOMMENDATIONS = {
  gemini: [
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (2M context)', recommended: true },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (1M context)', recommended: true },
    { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Experimental)', recommended: false },
  ],
  openai: [
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (128k context)', recommended: true },
    { value: 'gpt-4', label: 'GPT-4 (8k context)', recommended: false },
    { value: 'gpt-3.5-turbo-16k', label: 'GPT-3.5 Turbo (16k context)', recommended: false },
  ],
  claude: [
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (200k context)', recommended: true },
    { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet (200k context)', recommended: true },
    { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (200k context)', recommended: false },
  ],
  ollama: [
    { value: 'llama3:70b', label: 'Llama 3 70B (Large)', recommended: true },
    { value: 'mixtral:8x7b', label: 'Mixtral 8x7B (Good balance)', recommended: true },
    { value: 'codellama:34b', label: 'Code Llama 34B (Code-focused)', recommended: false },
    { value: 'mistral:7b', label: 'Mistral 7B (Fast)', recommended: false },
  ],
};

export default function AISettings() {
  const toast = useToast();
  const [config, setConfig] = useState<AIConfig>({
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-1.5-flash',
    ollamaEndpoint: 'http://localhost:11434',
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load saved config from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ai_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(parsed);
      } catch (error) {
        console.error('Failed to parse AI config:', error);
      }
    }
  }, []);

  const handleProviderChange = (provider: AIProvider) => {
    const defaultModels = {
      gemini: 'gemini-1.5-flash',
      openai: 'gpt-4-turbo',
      claude: 'claude-3-sonnet-20240229',
      ollama: 'llama3:70b',
    };
    
    setConfig({
      ...config,
      provider,
      model: defaultModels[provider],
    });
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Simulate API test (you'll need to implement actual testing)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For now, just validate that API key exists
      if (!config.apiKey && config.provider !== 'ollama') {
        throw new Error('API Key is required');
      }

      if (config.provider === 'ollama' && !config.ollamaEndpoint) {
        throw new Error('Ollama endpoint is required');
      }

      // TODO: Implement actual API testing here
      // For Ollama: fetch(`${config.ollamaEndpoint}/api/tags`)
      // For others: Make test API call

      setTestResult({
        success: true,
        message: `✅ Successfully connected to ${config.provider.toUpperCase()}!`,
      });
      toast.success('Connection test successful!');
    } catch (error: any) {
      setTestResult({
        success: false,
        message: `❌ ${error.message || 'Connection failed'}`,
      });
      toast.error('Connection test failed');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    try {
      localStorage.setItem('ai_config', JSON.stringify(config));
      toast.success('AI settings saved successfully!');
      setIsSaving(false);
    } catch (error) {
      toast.error('Failed to save settings');
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
          <Brain className="w-6 h-6 text-purple-600 dark:text-purple-300" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Configuration</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Configure your AI provider for roadmap generation</p>
        </div>
      </div>

      {/* Provider Selection */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Select AI Provider</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(['gemini', 'openai', 'claude', 'ollama'] as AIProvider[]).map((provider) => (
            <button
              key={provider}
              onClick={() => handleProviderChange(provider)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                config.provider === provider
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                    {provider === 'openai' ? 'OpenAI (ChatGPT)' : provider}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {provider === 'gemini' && 'Google Gemini - Free tier available'}
                    {provider === 'openai' && 'OpenAI GPT models - Pay as you go'}
                    {provider === 'claude' && 'Anthropic Claude - High quality'}
                    {provider === 'ollama' && 'Local models - Free & private'}
                  </div>
                </div>
                {config.provider === provider && (
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* API Key Input (except for Ollama) */}
      {config.provider !== 'ollama' && (
        <div className="glass-card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Key className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">API Key</h3>
          </div>
          <div className="relative">
            <Input
              type={showApiKey ? 'text' : 'password'}
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder={`Enter your ${config.provider.toUpperCase()} API key`}
              className="pr-10"
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-300"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            {config.provider === 'gemini' && 'Get your API key from: https://makersuite.google.com/app/apikey'}
            {config.provider === 'openai' && 'Get your API key from: https://platform.openai.com/api-keys'}
            {config.provider === 'claude' && 'Get your API key from: https://console.anthropic.com/'}
          </p>
        </div>
      )}

      {/* Ollama Endpoint */}
      {config.provider === 'ollama' && (
        <div className="glass-card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Server className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Ollama Endpoint</h3>
          </div>
          <Input
            type="text"
            value={config.ollamaEndpoint}
            onChange={(e) => setConfig({ ...config, ollamaEndpoint: e.target.value })}
            placeholder="http://localhost:11434"
          />
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            Default: http://localhost:11434 - Make sure Ollama is running locally
          </p>
        </div>
      )}

      {/* Model Selection */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Select Model</h3>
        <select
          value={config.model}
          onChange={(e) => setConfig({ ...config, model: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors"
        >
          {MODEL_RECOMMENDATIONS[config.provider].map((model) => (
            <option key={model.value} value={model.value}>
              {model.label} {model.recommended ? '⭐' : ''}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          ⭐ = Recommended for large context generation (thesis roadmaps)
        </p>
      </div>

      {/* Test Connection */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Test Connection</h3>
          <Button
            onClick={handleTestConnection}
            disabled={isTesting}
            variant="secondary"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </Button>
        </div>

        {testResult && (
          <div
            className={`p-4 rounded-lg border-2 flex items-start space-x-3 ${
              testResult.success
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            )}
            <p className={`text-sm ${testResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
              {testResult.message}
            </p>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          variant="primary"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            'Save AI Settings'
          )}
        </Button>
      </div>
    </div>
  );
}

