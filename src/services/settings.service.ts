import { settingsRepository } from '../repositories/settings.repository';
import { MasterSetup } from '../lib/types';

export class SettingsService {
  async getSettings(): Promise<MasterSetup> {
    return settingsRepository.getSettings();
  }

  async updateSettings(settings: MasterSetup): Promise<MasterSetup> {
    return settingsRepository.updateSettings(settings);
  }
}

export const settingsService = new SettingsService();
