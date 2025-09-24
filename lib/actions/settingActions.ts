"use server"

import {
  CreateSettingsData,
  UpdateSettingsData
} from '@/lib/datasources/settings.datasource';
import { settingsController } from '@/lib/controllers/settings.controller';

/**
 * Get all settings
 */
export async function getSettingsAction() {
  try {
    const result = await settingsController.getAll();
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error in getSettingsAction:', error);
    return [];
  }
}

/**
 * Get settings by ID
 */
export async function getSettingsByIdAction(id: string) {
  try {
    const result = await settingsController.getById(id);
    return result;
  } catch (error) {
    console.error('Error in getSettingsByIdAction:', error);
    return null;
  }
}

/**
 * Get settings by name
 */
export async function getSettingsByNameAction(name: string) {
  console.log('🔍 getSettingsByNameAction: Looking for setting with name:', name);
  
  try {
    const result = await settingsController.getByName(name);
    return result;
  } catch (error) {
    return null;
  }
}

/**
 * Create new settings
 */
export async function createSettingsAction(data: CreateSettingsData) {
  try {
    const result = await settingsController.create(data);
    return result;
  } catch (error) {
    console.error('Error in createSettingsAction:', error);
    return null;
  }
}

/**
 * Update settings
 */
export async function updateSettingsAction(id: string, data: UpdateSettingsData) {
  try {
    const result = await settingsController.update(id, data);
    return result;
  } catch (error) {
    console.error('Error in updateSettingsAction:', error);
    return null;
  }
}

/**
 * Update settings by name (convenience method)
 */
export async function updateSettingsByNameAction(name: string, values: any) {
  try {
    // First, get the settings by name to get the ID
    const existingSettings = await settingsController.getByName(name);

    if (!existingSettings) {
      return null;
    }

    // Check if data is an array or single object
    const settings = Array.isArray(existingSettings)
      ? existingSettings[0]
      : existingSettings;

    if (!settings) {
      return null;
    }

    // Update using the ID
    const result = await settingsController.update(settings.id, { values });
    return result;
  } catch (error) {
    console.error('Error in updateSettingsByNameAction:', error);
    return null;
  }
}