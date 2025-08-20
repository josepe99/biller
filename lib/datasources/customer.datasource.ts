import { BaseDatasource } from './base.datasource';

export class CustomerDataSource extends BaseDatasource<'customer'> {
  constructor() {
    super('customer');
  }

  async findByRuc(ruc: string) {
    return await this.model.findUnique({ where: { ruc, deletedAt: null } });
  }
}
