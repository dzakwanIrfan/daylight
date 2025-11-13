'use client';

import { useState } from 'react';
import { User, Shield, Settings } from 'lucide-react';
import { ProfileInfo } from './profile-info';
import { SecuritySettings } from './security-settings';
import { PreferencesSettings } from './preferences-settings';

type SettingsTab = 'profile' | 'security' | 'preferences';

export function ProfileSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs = [
    { id: 'profile' as SettingsTab, label: 'Basic Info', icon: User },
    { id: 'security' as SettingsTab, label: 'Security', icon: Shield },
    { id: 'preferences' as SettingsTab, label: 'Preferences', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                  flex items-center gap-2
                  ${
                    activeTab === tab.id
                      ? 'border-brand text-brand'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                  }
                `}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeTab === 'profile' && <ProfileInfo />}
        {activeTab === 'security' && <SecuritySettings />}
        {activeTab === 'preferences' && <PreferencesSettings />}
      </div>
    </div>
  );
}