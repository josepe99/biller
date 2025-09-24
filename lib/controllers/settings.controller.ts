import { Settings } from '@prisma/client';
import { SettingsDatasource, CreateSettingsData, UpdateSettingsData } from '@/lib/datasources/settings.datasource';
import { BaseController } from './base.controller';


export class SettingsController extends BaseController<SettingsDatasource> {
  constructor() {
    super(new SettingsDatasource());
  }

  async create(data: CreateSettingsData): Promise<Settings | null> {
    try {

      const nameExists = await this.datasource.existsByName(data.name.trim());
      if (nameExists) {
        return null;
      }

      return this.datasource.create({
        name: data.name.trim(),
        description: data.description,
        values: data.values,
      });
    } catch (error) {
      console.error('Error creating settings:', error);
      return null;
    }
  }

  async update(id: string, data: UpdateSettingsData): Promise<Settings | null> {
    try {
      const existingSettings = await this.datasource.getById(id);
      if (!existingSettings) {
        return null;
      }

      return this.datasource.update(id, data);
    } catch (error) {
      console.error('Error updating settings:', error);
      return null;
    }
  }

  async getById(id: string): Promise<Settings | null> {
    try {
      const settings = await this.datasource.getById(id);
      if (!settings) {
        return null
      }

      return settings;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return null;
    }
  }

  async getByName(name: string): Promise<Settings | Settings[] | null> {
    try {
      return this.datasource.getByName(name);
    } catch (error) {
      return null;
    }
  }

  async getAll(): Promise<Settings | Settings[]> {
    try {
      return this.datasource.getAll();
    } catch (error) {
      console.error('Error fetching all settings:', error);
      return [];
    }
  }
}

export const settingsController = new SettingsController();