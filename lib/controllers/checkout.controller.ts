import { CheckoutDatasource } from '@/lib/datasources/checkout.datasource';
import { BaseController } from './base.controller';

export class CheckoutController extends BaseController<CheckoutDatasource> {
  constructor() {
    super(new CheckoutDatasource());
  }

  async getAllCheckouts() {
    return await this.datasource.getAllCheckouts();
  }

  async getCheckoutById(id: string) {
    return await this.datasource.getCheckoutById(id);
  }

  async getActiveCheckouts() {
    return await this.datasource.getActiveCheckouts();
  }

  async getCheckoutWithSales(id: string) {
    return await this.datasource.getCheckoutWithSales(id);
  }
}
