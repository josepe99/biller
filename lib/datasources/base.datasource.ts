import { prisma } from '../prisma';

export class BaseDatasource<TModelName extends keyof typeof prisma> {
  protected model: any;

  constructor(modelName: TModelName) {
    this.model = prisma[modelName];
  }

  async getAll(where: any = { deletedAt: null }) {
    return await this.model.findMany({ where });
  }

  async getById(id: string) {
    return await this.model.findUnique({ where: { id, deletedAt: null } });
  }

  async create(data: any) {
    return await this.model.create({ data: { ...data, deletedAt: null } });
  }

  async update(id: string, data: any) {
    return await this.model.update({ where: { id }, data });
  }

  async delete(id: string) {
    return await this.model.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
