import { CheckoutDatasource } from '@/lib/datasources/checkout.datasource';
import { BaseController } from './base.controller';

export class CheckoutController extends BaseController<CheckoutDatasource> {
  checkoutDatasource: CheckoutDatasource;
  constructor() {
    super(new CheckoutDatasource());
    this.checkoutDatasource = new CheckoutDatasource();
  }

  getList() {
    return this.checkoutDatasource.getList();
  }

  getAllCheckouts() {
    return this.checkoutDatasource.getAllCheckouts();
  }

  getCheckoutById(id: string) {
    return this.checkoutDatasource.getCheckoutById(id);
  }

  getActiveCheckouts() {
    return this.checkoutDatasource.getActiveCheckouts();
  }

  getCheckoutWithSales(id: string) {
    return this.checkoutDatasource.getCheckoutWithSales(id);
  }
}
