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
    return result;
  } catch (error) {
    console.error('Error in getSettingsAction:', error);
    return {
      success: false,
      error: 'Failed to fetch settings',
      data: []
    };
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
    return {
      success: false,
      error: 'Failed to fetch settings',
      data: null
    };
  }
}

/**
 * Get settings by name
 */
export async function getSettingsByNameAction(name: string) {
  try {
    const result = await settingsController.getByName(name);
    return result;
  } catch (error) {
    console.error('Error in getSettingsByNameAction:', error);
    return {
      success: false,
      error: 'Failed to fetch settings',
      data: null
    };
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
    return {
      success: false,
      error: 'Failed to create settings'
    };
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
    return {
      success: false,
      error: 'Failed to update settings'
    };
  }
}

/**
 * Update settings by name (convenience method)
 */
export async function updateSettingsByNameAction(name: string, values: any) {
  try {
    // First, get the settings by name to get the ID
    const existingSettings = await settingsController.getByName(name);

    if (!existingSettings.success || !existingSettings.data) {
      return {
        success: false,
        error: 'Settings not found'
      };
    }

    // Check if data is an array or single object
    const settings = Array.isArray(existingSettings.data)
      ? existingSettings.data[0]
      : existingSettings.data;

    if (!settings) {
      return {
        success: false,
        error: 'Settings not found'
      };
    }

    // Update using the ID
    const result = await settingsController.update(settings.id, { values });
    return result;
  } catch (error) {
    console.error('Error in updateSettingsByNameAction:', error);
    return {
      success: false,
      error: 'Failed to update settings'
    };
  }
}