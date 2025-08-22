import { BaseDatasource } from './base.datasource';

export class CustomerDataSource extends BaseDatasource<'customer'> {
  constructor() {
    super('customer');
  }

  async findByRuc(ruc: string) {
    return await this.model.findUnique({ where: { ruc, deletedAt: null } });
  }

  async search(query: string) {
    if (!query) {
      return await this.model.findMany({ where: { deletedAt: null } });
    }
    return await this.model.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { ruc: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
  }

  
}
