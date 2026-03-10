import { useUserSettingsStore } from '../features/settings/store/userSettingsStore';
import { UxMode } from '../features/settings/types/settings.types';

export function useUxMode() {
  const settings = useUserSettingsStore(state => state.settings);
  const updateSettings = useUserSettingsStore(state => state.updateSettings);

  const uxMode: UxMode = settings?.uxMode || 'beginner';
  const isBeginner = uxMode === 'beginner';
  const isAnalyst = uxMode === 'analyst';

  const setUxMode = (mode: UxMode) => {
    updateSettings({ uxMode: mode });
  };

  return { uxMode, isBeginner, isAnalyst, setUxMode };
}
