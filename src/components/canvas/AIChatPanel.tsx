// AI Chat Panel Component
'use client';

import { useState, useRef, useEffect } from 'react';
import { Project } from '@/lib/supabase';

interface Message {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
}

interface AIChatPanelProps {
  projectId: string;
  project: Project;
  onClose: () => void;
}

export default function AIChatPanel({ projectId, project, onClose }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: `👋 Hi! I'm your AI Agents system powered by Gemini. I can intelligently help you with:

🔽 **Break Down** - Split complex tasks into actionable subtasks
✨ **Refine** - Enhance node descriptions with specific details
🔍 **Analyze** - Find gaps and suggest missing steps
📊 **Progress** - Track your thesis journey & suggest next actions
🧠 **Context-Aware** - I understand your entire project structure

Try asking: "Break down my Literature Review step" or "What should I work on next?"`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call AI Agents API
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          message: input.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      // Handle both success and error responses
      if (data.message) {
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'agent',
          content: data.message,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, agentMessage]);
      } else if (data.userMessage) {
        // User-friendly error from server
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'system',
          content: data.userMessage,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Fallback error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: "⚠️ Connection issue. Please check your internet and try again.\n\nTip: Gemini free tier sometimes gets overloaded. Wait 30 seconds and retry!",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    '🔽 Break down task',
    '✨ Refine details',
    '🔍 Find gaps',
    '📊 Analyze progress',
  ];

  return (
    <div className="h-full glass-panel flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/20 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🤖</span>
            <h3 className="font-bold text-gray-900">AI Agents</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">BETA</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        <p className="text-xs text-gray-600">
          Ask me anything about your thesis roadmap
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : message.role === 'system'
                  ? 'bg-gray-100 text-gray-700'
                  : 'glass-card text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="glass-card rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="animate-bounce">💭</div>
                <p className="text-sm text-gray-600">AI is thinking...</p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-white/20 flex-shrink-0">
        <p className="text-xs text-gray-600 mb-2">Quick actions:</p>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action}
              onClick={() => setInput(action)}
              className="text-xs px-2 py-1 rounded-lg bg-white/50 hover:bg-white/70 text-gray-700 transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/20 flex-shrink-0">
        <div className="flex items-end space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask AI anything..."
            rows={3}
            className="flex-1 px-3 py-2 rounded-lg glass border border-gray-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm resize-none"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {loading ? '...' : '→'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

