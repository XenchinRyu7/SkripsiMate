// Settings Modal Component
'use client';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">⚙️ Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Canvas Settings */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Canvas Settings</h3>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 glass rounded-lg">
                <span className="text-sm text-gray-700">Show Grid</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
              <label className="flex items-center justify-between p-3 glass rounded-lg">
                <span className="text-sm text-gray-700">Snap to Grid</span>
                <input type="checkbox" className="rounded" />
              </label>
              <label className="flex items-center justify-between p-3 glass rounded-lg">
                <span className="text-sm text-gray-700">Show Minimap</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
            </div>
          </div>

          {/* AI Settings */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">AI Agents Settings</h3>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 glass rounded-lg">
                <span className="text-sm text-gray-700">Auto-suggestions</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
              <label className="flex items-center justify-between p-3 glass rounded-lg">
                <span className="text-sm text-gray-700">Context-aware responses</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">About</h3>
            <div className="p-4 glass rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <strong>SkripsiMate</strong> v1.0.0 BETA
              </p>
              <p className="text-xs text-gray-600">
                AI-powered thesis planning tool with intelligent agents system.
                Powered by Gemini 2.5 Pro.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

