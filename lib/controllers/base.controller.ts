export class BaseController<TDatasource> {
  protected datasource: TDatasource;

  constructor(datasource: TDatasource) {
    this.datasource = datasource;
  }

  async getAll() {
    // @ts-ignore
    return await this.datasource.getAll();
  }

  async getById(id: string) {
    // @ts-ignore
    return await this.datasource.getById(id);
  }

  async create(data: any) {
    // @ts-ignore
    return await this.datasource.create(data);
  }

  async update(id: string, data: any) {
    // @ts-ignore
    return await this.datasource.update(id, data);
  }

  async delete(id: string) {
    // @ts-ignore
    return await this.datasource.delete(id);
  }
}
