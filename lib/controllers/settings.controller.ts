import { Settings } from '@prisma/client';
import { SettingsDatasource, CreateSettingsData, UpdateSettingsData } from '@/lib/datasources/settings.datasource';
import { BaseController } from './base.controller';

export interface SettingsResponse {
  success: boolean;
  data?: Settings | Settings[];
  message?: string;
  error?: string;
}

export class SettingsController extends BaseController<SettingsDatasource> {
  constructor() {
    super(new SettingsDatasource());
  }

  async create(data: CreateSettingsData): Promise<SettingsResponse> {
    try {
      if (!data.name || data.name.trim() === '') {
        return { success: false, error: 'Settings name is required' };
      }

      if (!data.values) {
        return { success: false, error: 'Settings values are required' };
      }

      const nameExists = await this.datasource.existsByName(data.name.trim());
      if (nameExists) {
        return { success: false, error: 'Settings with this name already exist' };
      }

      const settings = await this.datasource.create({
        name: data.name.trim(),
        description: data.description,
        values: data.values,
      });

      return { 
        success: true, 
        data: settings, 
        message: 'Settings created successfully' 
      };
    } catch (error) {
      console.error('Error creating settings:', error);
      return { 
        success: false, 
        error: 'Failed to create settings' 
      };
    }
  }

  async update(id: string, data: UpdateSettingsData): Promise<SettingsResponse> {
    try {
      const existingSettings = await this.datasource.getById(id);
      if (!existingSettings) {
        return { success: false, error: 'Settings not found' };
      }

      if (data.name && data.name.trim() !== existingSettings.name) {
        const nameExists = await this.datasource.existsByName(data.name.trim(), id);
        if (nameExists) {
          return { success: false, error: 'Settings with this name already exist' };
        }
      }

      const updatedSettings = await this.datasource.update(id, data);

      return { 
        success: true, 
        data: updatedSettings, 
        message: 'Settings updated successfully' 
      };
    } catch (error) {
      console.error('Error updating settings:', error);
      return { 
        success: false, 
        error: 'Failed to update settings' 
      };
    }
  }

  async getById(id: string): Promise<SettingsResponse> {
    try {
      const settings = await this.datasource.getById(id);
      if (!settings) {
        return { success: false, error: 'Settings not found' };
      }

      return { 
        success: true, 
        data: settings 
      };
    } catch (error) {
      console.error('Error fetching settings:', error);
      return { 
        success: false, 
        error: 'Failed to fetch settings' 
      };
    }
  }

  async getByName(name: string): Promise<SettingsResponse> {
    try {
      const settings = await this.datasource.getByName(name);
      if (!settings) {
        return { success: false, error: 'Settings not found' };
      }

      return { 
        success: true, 
        data: settings 
      };
    } catch (error) {
      console.error('Error fetching settings by name:', error);
      return { 
        success: false, 
        error: 'Failed to fetch settings' 
      };
    }
  }

  async getAll(): Promise<SettingsResponse> {
    try {
      const settings = await this.datasource.getAll();
      return { 
        success: true, 
        data: settings 
      };
    } catch (error) {
      console.error('Error fetching all settings:', error);
      return { 
        success: false, 
        error: 'Failed to fetch settings' 
      };
    }
  }
}

export const settingsController = new SettingsController();