// ============================================
// UTILITY FUNCTIONS
// ============================================

import { v4 as uuidv4 } from 'uuid';
import { Node, Project } from '../types';

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return uuidv4();
};

/**
 * Format date to readable string
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  return formatDate(d);
};

/**
 * Format distance to now (alias for formatRelativeTime)
 */
export const formatDistanceToNow = formatRelativeTime;

/**
 * Calculate progress percentage
 */
export const calculateProgress = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const isStrongPassword = (password: string): boolean => {
  return password.length >= 6;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Generate content hash for change detection
 */
export const generateContentHash = (content: string): string => {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
};

/**
 * Calculate estimated completion date
 */
export const calculateEstimatedCompletion = (
  startDate: Date,
  timeline: string
): Date => {
  const date = new Date(startDate);
  const match = timeline.match(/(\d+)\s*(month|week|day)s?/i);
  
  if (!match) return new Date(date.setMonth(date.getMonth() + 6)); // Default 6 months
  
  const amount = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  
  switch (unit) {
    case 'month':
      date.setMonth(date.getMonth() + amount);
      break;
    case 'week':
      date.setDate(date.getDate() + amount * 7);
      break;
    case 'day':
      date.setDate(date.getDate() + amount);
      break;
  }
  
  return date;
};

/**
 * Sort nodes by order
 */
export const sortNodesByOrder = (nodes: Node[]): Node[] => {
  return [...nodes].sort((a, b) => a.order - b.order);
};

/**
 * Get child nodes of a parent
 */
export const getChildNodes = (nodes: Node[], parentId: string): Node[] => {
  return nodes.filter(node => node.parentId === parentId);
};

/**
 * Get all descendants of a node (recursive)
 */
export const getAllDescendants = (nodes: Node[], nodeId: string): Node[] => {
  const children = getChildNodes(nodes, nodeId);
  const descendants = [...children];
  
  children.forEach(child => {
    descendants.push(...getAllDescendants(nodes, child.id));
  });
  
  return descendants;
};

/**
 * Check if node has completed dependencies
 */
export const hasCompletedDependencies = (
  node: Node,
  allNodes: Node[]
): boolean => {
  if (node.dependencies.length === 0) return true;
  
  const dependencyNodes = allNodes.filter(n => node.dependencies.includes(n.id));
  return dependencyNodes.every(n => n.status === 'completed');
};

/**
 * Get next available nodes (dependencies completed)
 */
export const getNextAvailableNodes = (nodes: Node[]): Node[] => {
  return nodes.filter(
    node =>
      node.status === 'pending' &&
      hasCompletedDependencies(node, nodes)
  );
};

/**
 * Calculate node position for auto-layout
 */
export const calculateNodePosition = (
  level: number,
  orderIndex: number,
  nodeWidth: number = 280,
  nodeHeight: number = 180
): { x: number; y: number } => {
  const horizontalSpacing = 320;
  const verticalSpacing = 220;
  
  return {
    x: orderIndex * horizontalSpacing,
    y: level * verticalSpacing,
  };
};

/**
 * Format time estimate (e.g., "3 days" or "2 weeks")
 */
export const formatTimeEstimate = (estimate: string): string => {
  return estimate.trim();
};

/**
 * Parse time estimate to hours
 */
export const parseTimeToHours = (estimate: string): number => {
  const match = estimate.match(/(\d+)\s*(hour|day|week|month)s?/i);
  
  if (!match) return 0;
  
  const amount = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  
  switch (unit) {
    case 'hour':
      return amount;
    case 'day':
      return amount * 8; // 8 hours per day
    case 'week':
      return amount * 40; // 40 hours per week
    case 'month':
      return amount * 160; // ~160 hours per month
    default:
      return 0;
  }
};

/**
 * Format hours to readable time estimate
 */
export const formatHoursToEstimate = (hours: number): string => {
  if (hours < 8) return `${hours} hours`;
  if (hours < 40) return `${Math.round(hours / 8)} days`;
  if (hours < 160) return `${Math.round(hours / 40)} weeks`;
  return `${Math.round(hours / 160)} months`;
};

/**
 * Combine node content for embedding
 */
export const combineNodeContent = (node: Node): string => {
  const parts = [
    `Title: ${node.title}`,
    `Description: ${node.description}`,
    `Type: ${node.type}`,
    `Priority: ${node.priority}`,
  ];
  
  if (node.notes) {
    parts.push(`Notes: ${node.notes}`);
  }
  
  if (node.userNotes && node.userNotes.length > 0) {
    parts.push(`User Notes: ${node.userNotes.join('. ')}`);
  }
  
  return parts.join('. ');
};

/**
 * Sleep/delay utility
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry function with exponential backoff
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await sleep(delay * Math.pow(2, i)); // Exponential backoff
      }
    }
  }
  
  throw lastError!;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Download text as file
 */
export const downloadTextFile = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export project to JSON
 */
export const exportProjectToJSON = (project: Project, nodes: Node[]): string => {
  const exportData = {
    project,
    nodes,
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
  };
  
  return JSON.stringify(exportData, null, 2);
};

/**
 * Get status color
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'rgba(148, 163, 184, 0.8)',
    in_progress: 'rgba(59, 130, 246, 0.8)',
    completed: 'rgba(34, 197, 94, 0.8)',
    blocked: 'rgba(239, 68, 68, 0.8)',
  };
  
  return colors[status] || colors.pending;
};

/**
 * Get priority color
 */
export const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    low: '#64748b',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626',
  };
  
  return colors[priority] || colors.medium;
};

/**
 * Class names utility (like clsx)
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

