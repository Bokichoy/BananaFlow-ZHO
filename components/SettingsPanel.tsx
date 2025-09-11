
import React, { useState, useEffect } from 'react';
import type { Theme, Shortcuts } from '../types';

interface SettingsPanelProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  shortcuts: Shortcuts;
  setShortcuts: (shortcuts: Shortcuts) => void;
  onClose: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

const ShortcutInput: React.FC<{ label: string; value: string; onChange: (value: string) => void; modifier: string; }> = ({ label, value, onChange, modifier }) => {
    return (
        <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">{label}</label>
            <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs text-gray-400 bg-neutral-900 rounded-md">{modifier}</span>
                <span className="text-gray-400">+</span>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value.slice(-1).toLowerCase())}
                    maxLength={1}
                    className="w-12 px-2 py-1 text-center text-white bg-neutral-900 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
        </div>
    );
};

const ColorInput: React.FC<{ label: string; value: string; onChange: (value: string) => void; }> = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between">
        <label className="text-sm text-gray-300">{label}</label>
        <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-24 h-8 p-1 bg-neutral-700 border border-neutral-600 rounded-md cursor-pointer"
        />
    </div>
);


const SettingsPanel: React.FC<SettingsPanelProps> = ({ theme, setTheme, shortcuts, setShortcuts, onClose, zoom, onZoomChange }) => {
  const [localTheme, setLocalTheme] = useState(theme);
  const [localShortcuts, setLocalShortcuts] = useState(shortcuts);
  const [localZoom, setLocalZoom] = useState(zoom);

  useEffect(() => {
    setLocalTheme(theme);
    setLocalShortcuts(shortcuts);
    setLocalZoom(zoom);
  }, [theme, shortcuts, zoom]);

  const handleSave = () => {
    setTheme(localTheme);
    setShortcuts(localShortcuts);
    onZoomChange(localZoom);
    onClose();
  };

  const shortcutConfigs = [
    { key: 'run', label: 'Run Workflow', modifier: 'Ctrl/⌘' },
    { key: 'save', label: 'Save Workflow', modifier: 'Ctrl/⌘' },
    { key: 'load', label: 'Load Workflow', modifier: 'Ctrl/⌘' },
    { key: 'copy', label: 'Copy Nodes', modifier: 'Ctrl/⌘' },
    { key: 'paste', label: 'Paste Nodes', modifier: 'Ctrl/⌘' },
    { key: 'group', label: 'Group Nodes', modifier: 'Ctrl/⌘' },
    { key: 'ungroup', label: 'Ungroup Nodes', modifier: 'Ctrl/⌘ + Shift' },
    { key: 'mute', label: 'Mute/Unmute Nodes', modifier: 'Ctrl/⌘' },
  ];

  const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            setLocalTheme(t => ({ ...t, canvasBackgroundImage: event.target?.result as string }));
        };
        reader.readAsDataURL(file);
    }
    e.target.value = ''; // Reset input
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-neutral-800 rounded-lg shadow-xl w-full max-w-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-neutral-700">
            <h2 className="text-xl font-bold text-white">Settings</h2>
        </div>
        <div className="p-6 overflow-y-auto" style={{ maxHeight: '70vh' }}>
            <div className="space-y-8">
                {/* Appearance Section */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-white">Appearance</h3>
                    <div className="space-y-4">
                        <ColorInput 
                            label="Canvas Background Color"
                            value={localTheme.canvasBackground}
                            onChange={(val) => setLocalTheme(t => ({ ...t, canvasBackground: val }))}
                        />
                        <div className="flex items-center justify-between">
                            <label className="text-sm text-gray-300">Canvas Background Image</label>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => document.getElementById('background-image-input')?.click()}
                                    className="px-3 py-1 text-xs text-white bg-neutral-700 hover:bg-neutral-600 rounded-md"
                                >
                                    Upload
                                </button>
                                {localTheme.canvasBackgroundImage && (
                                    <button
                                        onClick={() => setLocalTheme(t => ({ ...t, canvasBackgroundImage: null }))}
                                        className="px-3 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded-md"
                                    >
                                        Clear
                                    </button>
                                )}
                                <input
                                    id="background-image-input"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleBackgroundImageUpload}
                                />
                            </div>
                        </div>
                        <ColorInput
                            label="Node Background Color"
                            value={localTheme.nodeBackground}
                            onChange={(val) => setLocalTheme(t => ({...t, nodeBackground: val}))}
                        />
                         <div className="flex items-center justify-between">
                            <label className="text-sm text-gray-300">Node Opacity</label>
                                <div className="flex items-center space-x-2 w-48">
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.05" 
                                    value={localTheme.nodeOpacity ?? 0.7} 
                                    onChange={e => setLocalTheme(t => ({...t, nodeOpacity: parseFloat(e.target.value)}))} 
                                    className="w-full" 
                                />
                                <span className="text-sm text-gray-300 w-12 text-center">
                                    {Math.round((localTheme.nodeOpacity ?? 0.7) * 100)}%
                                </span>
                            </div>
                        </div>
                        <ColorInput
                            label="Node Text Color"
                            value={localTheme.nodeTextColor}
                            onChange={(val) => setLocalTheme(t => ({...t, nodeTextColor: val}))}
                        />
                        <ColorInput
                            label="Uploader Text Color"
                            value={localTheme.uploaderTextColor}
                            onChange={(val) => setLocalTheme(t => ({...t, uploaderTextColor: val}))}
                        />
                         <ColorInput 
                            label="Button Color"
                            value={localTheme.buttonColor}
                            onChange={(val) => setLocalTheme(t => ({ ...t, buttonColor: val }))}
                        />
                    </div>
                </div>

                {/* Canvas & Connections Section */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-white">Canvas & Connections</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm text-gray-300">Canvas Zoom</label>
                            <div className="flex items-center space-x-2 w-48">
                                <input type="range" min="0.2" max="2.5" step="0.01" value={localZoom} onChange={e => setLocalZoom(parseFloat(e.target.value))} className="w-full" />
                                <input type="number" min="0.2" max="2.5" step="0.1" value={localZoom.toFixed(2)} onChange={e => setLocalZoom(parseFloat(e.target.value))} className="w-20 px-2 py-1 text-center text-white bg-neutral-900 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-sm text-gray-300">Connection Line Thickness</label>
                             <div className="flex items-center space-x-2 w-48">
                                <input type="range" min="1" max="10" step="1" value={localTheme.edgeWidth} onChange={e => setLocalTheme(t => ({...t, edgeWidth: parseInt(e.target.value)}))} className="w-full" />
                                <span className="text-sm text-gray-300 w-8 text-center">{localTheme.edgeWidth}px</span>
                            </div>
                        </div>
                         <ColorInput 
                            label="Connection Color: Text"
                            value={localTheme.edgeColors.text}
                            onChange={(val) => setLocalTheme(t => ({ ...t, edgeColors: {...t.edgeColors, text: val} }))}
                        />
                         <ColorInput 
                            label="Connection Color: Image"
                            value={localTheme.edgeColors.image}
                            onChange={(val) => setLocalTheme(t => ({ ...t, edgeColors: {...t.edgeColors, image: val} }))}
                        />
                         <ColorInput 
                            label="Connection Color: Video"
                            value={localTheme.edgeColors.video}
                            onChange={(val) => setLocalTheme(t => ({ ...t, edgeColors: {...t.edgeColors, video: val} }))}
                        />
                         <ColorInput 
                            label="Connection Color: Any"
                            value={localTheme.edgeColors.any}
                            onChange={(val) => setLocalTheme(t => ({ ...t, edgeColors: {...t.edgeColors, any: val} }))}
                        />
                    </div>
                </div>

                {/* Shortcuts Section */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-white">Keyboard Shortcuts</h3>
                    <div className="space-y-3">
                        {shortcutConfigs.map(sc => (
                             <ShortcutInput
                                key={sc.key}
                                label={sc.label}
                                value={localShortcuts[sc.key as keyof Shortcuts]}
                                onChange={(val) => setLocalShortcuts(s => ({ ...s, [sc.key]: val }))}
                                modifier={sc.modifier}
                            />
                        ))}
                         <div className="flex items-center justify-between">
                            <label className="text-sm text-gray-300">Delete Selection</label>
                            <input
                                type="text"
                                value={localShortcuts.delete}
                                onChange={(e) => setLocalShortcuts(s => ({ ...s, delete: e.target.value }))}
                                className="w-24 px-2 py-1 text-center text-white bg-neutral-900 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
         <div className="flex justify-end p-6 space-x-4 border-t border-neutral-700 bg-neutral-800/50 rounded-b-lg">
            <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-white bg-neutral-600 rounded-lg hover:bg-neutral-700 transition-colors"
            >
                Cancel
            </button>
            <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors"
                style={{ backgroundColor: localTheme.buttonColor }}
            >
                Save Changes
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;