import { Settings, Prisma } from '@prisma/client';
import { BaseDatasource } from './base.datasource';

export interface CreateSettingsData {
  name: string;
  description?: string;
  values: any; // JSON data
}

export interface UpdateSettingsData {
  name?: string;
  description?: string;
  values?: any; // JSON data
}

export class SettingsDatasource extends BaseDatasource<'settings'> {
  constructor() {
    super('settings');
  }

  async create(data: CreateSettingsData): Promise<Settings> {
    return await this.model.create({
      data: {
        name: data.name,
        description: data.description,
        values: data.values,
      },
    });
  }

  async update(id: string, data: UpdateSettingsData): Promise<Settings> {
    return await this.model.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.values !== undefined && { values: data.values }),
        updatedAt: new Date(),
      },
    });
  }

  async getById(id: string): Promise<Settings | null> {
    return await this.model.findUnique({
      where: { id },
    });
  }

  async getByName(name: string): Promise<Settings | null> {
    const result = await this.model.findUnique({
      where: { name },
    });
    return result;
  }

  async getAll(): Promise<Settings[]> {
    return await this.model.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.SettingsWhereInput = {
      name: {
        equals: name,
        mode: 'insensitive',
      },
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const settings = await this.model.findFirst({ where });
    return !!settings;
  }
}

export const settingsDatasource = new SettingsDatasource();