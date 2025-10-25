// Dashboard Header with Profile Dropdown
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';

interface DashboardHeaderProps {
  user: FirebaseUser | null;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      router.push('/login');
    }
  };

  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <header className="glass-panel border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="text-3xl">📚</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SkripsiMate</h1>
              <p className="text-xs text-gray-600">AI-Powered Thesis Planner</p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications (placeholder) */}
            <button
              className="relative p-2 rounded-lg hover:bg-white/50 transition-colors"
              title="Notifications"
            >
              <span className="text-xl">🔔</span>
              {/* Notification badge */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Theme Toggle (placeholder) */}
            <button
              className="p-2 rounded-lg hover:bg-white/50 transition-colors"
              title="Toggle Theme"
            >
              <span className="text-xl">🌙</span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/50 transition-colors"
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                    {initials}
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.displayName || 'User'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {user?.email}
                  </p>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-600 transition-transform ${
                    showDropdown ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 glass-panel rounded-xl shadow-glass-lg overflow-hidden animate-slide-in-top">
                  <div className="p-4 border-b border-white/20">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.displayName || 'User'}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {user?.email}
                    </p>
                  </div>
                  
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        router.push('/dashboard');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-white/50 transition-colors flex items-center space-x-2"
                    >
                      <span>📊</span>
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        // TODO: Navigate to settings
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-white/50 transition-colors flex items-center space-x-2"
                    >
                      <span>⚙️</span>
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        // TODO: Navigate to help
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-white/50 transition-colors flex items-center space-x-2"
                    >
                      <span>❓</span>
                      <span>Help & Support</span>
                    </button>
                  </div>

                  <div className="border-t border-white/20 py-2">
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                    >
                      <span>🚪</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

