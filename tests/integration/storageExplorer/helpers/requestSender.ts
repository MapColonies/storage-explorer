import * as supertest from 'supertest';

export class StorageExplorerRequestSender {
  public constructor(private readonly app: Express.Application) {}
  

  public async getDirectory(pathSuffix: string): Promise<supertest.Response> {
    return supertest.agent(this.app).get(`/explorer/directory?pathSuffix=${pathSuffix}`).set('Content-Type', 'application/json');
  }

  public async getFile(pathSuffix: string): Promise<supertest.Response> {
    return supertest.agent(this.app).get('/explorer/file').query({pathSuffix}).set('Content-Type', 'application/json');
  }

  public async getFileById(id: string): Promise<supertest.Response> {
    return supertest.agent(this.app).get('/explorer/filebyid').query({id}).set('Content-Type', 'application/json');
  }

  public async getDecryptedId(id: string): Promise<supertest.Response> {
    return supertest.agent(this.app).get('/explorer/decryptid').query({id}).set('Content-Type', 'application/json');
  }

  public async getNoValidRoute(): Promise<supertest.Response> {
    return supertest.agent(this.app).get('/explorer/notvalid').set('Content-Type', 'application/json');
  }

  public async getNoValidUrl(): Promise<supertest.Response> {
    return supertest.agent(this.app).get('/idontknow/notvalid').set('Content-Type', 'application/json');
  }
  
}
