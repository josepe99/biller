import { BaseController } from './base.controller';
import { CustomerDataSource } from '../datasources/customer.datasource';

export class CustomerController extends BaseController<CustomerDataSource> {
  constructor(datasource: CustomerDataSource) {
    super(datasource);
  }

  async findByRuc(ruc: string) {
    return await this.datasource.findByRuc(ruc);
  }
}
