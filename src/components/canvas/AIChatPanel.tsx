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
  onNodesCreated?: () => void;  // Callback to refresh canvas
}

export default function AIChatPanel({ projectId, project, onClose, onNodesCreated }: AIChatPanelProps) {
  const [mode, setMode] = useState<'ask' | 'agents'>('ask');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: mode === 'ask' 
        ? `💬 **Ask Mode** - I'm here to answer questions and give advice!

I can help you with:
- 📊 **Analyze** your progress and roadmap
- 💡 **Suggest** what to work on next
- 🔍 **Find** gaps in your planning
- 💬 **Answer** questions about your thesis

I won't modify your nodes - just provide guidance!

Try: "What should I work on next?" or "Analyze my progress"`
        : `⚡ **Agents Mode** - I can take action on your behalf!

I can help you:
- ✨ **Create** new phases, steps, or substeps
- 🔨 **Update** existing node details
- 🔽 **Break down** complex tasks into subtasks
- 📝 **Refine** descriptions and requirements

Just tell me what you want, and I'll do it!

Try: "Add a step for data preprocessing" or "Break down the Literature Review into 4 subtasks"`,
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

  // Update system message when mode changes
  useEffect(() => {
    setMessages([{
      id: '1',
      role: 'system',
      content: mode === 'ask' 
        ? `💬 **Ask Mode** - I'm here to answer questions and give advice!

I can help you with:
- 📊 **Analyze** your progress and roadmap
- 💡 **Suggest** what to work on next
- 🔍 **Find** gaps in your planning
- 💬 **Answer** questions about your thesis

I won't modify your nodes - just provide guidance!

Try: "What should I work on next?" or "Analyze my progress"`
        : `⚡ **Agents Mode** - I can take action on your behalf!

I can help you:
- ✨ **Create** new phases, steps, or substeps
- 🔨 **Update** existing node details
- 🔽 **Break down** complex tasks into subtasks
- 📝 **Refine** descriptions and requirements

Just tell me what you want, and I'll do it!

Try: "Add a step for data preprocessing" or "Break down the Literature Review into 4 subtasks"`,
      timestamp: new Date(),
    }]);
  }, [mode]);

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
      // Call AI Agents API with mode
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          message: input.trim(),
          mode: mode,  // Pass mode to API
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      // Handle both success and error responses
      if (data.message) {
        let messageContent = data.message;

        // If Agents mode and action was executed, add action summary
        if (mode === 'agents' && data.action && data.action.type !== 'chat_only') {
          if (data.created_nodes && data.created_nodes.length > 0) {
            messageContent += `\n\n✅ **Created ${data.created_nodes.length} node(s):**\n`;
            data.created_nodes.forEach((node: any) => {
              messageContent += `- ${node.title} (${node.type})\n`;
            });
            
            // Refresh canvas to show new nodes
            if (onNodesCreated) {
              setTimeout(() => onNodesCreated(), 500);
            }
          }
          
          if (data.updated_nodes && data.updated_nodes.length > 0) {
            messageContent += `\n\n✏️ **Updated ${data.updated_nodes.length} node(s)**`;
            
            // Refresh canvas
            if (onNodesCreated) {
              setTimeout(() => onNodesCreated(), 500);
            }
          }
        }

        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'agent',
          content: messageContent,
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{mode === 'ask' ? '💬' : '⚡'}</span>
            <h3 className="font-bold text-gray-900 dark:text-gray-100">
              {mode === 'ask' ? 'Ask AI' : 'AI Agents'}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100 font-medium">
              BETA
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 text-xl transition-colors"
          >
            ×
          </button>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setMode('ask')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'ask'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'
            }`}
          >
            💬 Ask Mode
          </button>
          <button
            onClick={() => setMode('agents')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'agents'
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'
            }`}
          >
            ⚡ Agents Mode
          </button>
        </div>
        
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {mode === 'ask' 
            ? 'Get advice and insights without changing your project'
            : '🚀 AI can create and modify nodes autonomously!'}
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
                  ? 'bg-gray-100 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100'
                  : 'glass-card text-gray-900 dark:text-gray-100'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'
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
                <p className="text-sm text-gray-600 dark:text-gray-400">AI is thinking...</p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-white/20 flex-shrink-0">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Quick actions:</p>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action}
              onClick={() => setInput(action)}
              className="text-xs px-2 py-1 rounded-lg bg-white/50 hover:bg-white/70 text-gray-700 dark:text-gray-300 transition-colors"
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

