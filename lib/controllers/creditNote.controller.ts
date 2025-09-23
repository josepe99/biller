import { BaseController } from './base.controller';
import { CreditNoteDatasource, creditNoteDatasource } from '@/lib/datasources/creditNote.datasource';

export class CreditNoteController extends BaseController<CreditNoteDatasource> {
  constructor() {
    super(creditNoteDatasource);
  }

  async getAllDetailed(limit = 50, offset = 0) {
    return this.datasource.getAllDetailed(limit, offset);
  }

  async getByIdDetailed(id: string) {
    return this.datasource.getByIdDetailed(id);
  }

  async search(term: string, limit = 20) {
    return this.datasource.search(term, limit);
  }

  async create(data: Parameters<CreditNoteDatasource['create']>[0]) {
    return this.datasource.create(data);
  }

  async updateStatus(id: string, data: Parameters<CreditNoteDatasource['updateStatus']>[1]) {
    return this.datasource.updateStatus(id, data);
  }

  async getSuggestedNumberForSale(saleId: string) {
    return this.datasource.getSuggestedNumberForSale(saleId);
  }
}
