import path from 'path';
import { Logger } from '@map-colonies/js-logger';
import { Meter } from '@map-colonies/telemetry';
import { BoundCounter } from '@opentelemetry/api-metrics';
import { RequestHandler, Request } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { IConfig } from 'config';
import { SERVICES } from '../../common/constants';
import IFile from '../models/file.model';
import IFileMap from '../models/fileMap.model';
import { StorageExplorerManager } from '../models/storageExplorerManager';
import { decryptPath, DirOperations, encryptPath, filesArrayToMapObject } from '../../common/utilities';

// --  Both request should get path string, defaulted by mountDir --

// Should return file content by its id
type GetFileContentByIdHandler = RequestHandler<undefined, any, string, { id: string }>;

// Should return file content by its id
type GetFileHandler = RequestHandler<undefined, any, string, { path: string }>;


// Should return FileMap ( directory content )
type GetFolderHandler = RequestHandler<undefined, IFileMap<IFile> | {error: string}, string>;


@injectable()
export class StorageExplorerController {
  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(StorageExplorerManager) private readonly manager: StorageExplorerManager,
    @inject(SERVICES.METER) private readonly meter: Meter,
    @inject(SERVICES.CONFIG) private readonly config: IConfig,
    private readonly dirOperations: DirOperations
  ) {}


  public getFile: GetFileHandler = async (req, res) => {
    try {
      if(typeof req.query === 'undefined' || !('path' in req.query)) {
        throw new Error('path query is mandatory!');
      }

      const path: string = req.query.path;
      const fileContentBuffer = await this.dirOperations.getFileContent(path);

      res.send(JSON.parse(fileContentBuffer.toString('utf-8')))

    } catch (e) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error: (e as Error).message});
    }
  };

  public getFileContentById: GetFileContentByIdHandler = async (req, res) => {
    try {
      if(typeof req.query === 'undefined' || !('id' in req.query)) {
        throw new Error('id query is mandatory!');
      }

      const fileId: string = req.query.id;
      const pathDecrypted = decryptPath(fileId);
      const fileContentBuffer = await this.dirOperations.getFileContent(pathDecrypted);

      res.send(JSON.parse(fileContentBuffer.toString('utf-8')))

    } catch (e) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error: (e as Error).message});
    }
  };

  public getFolder: GetFolderHandler = async (req, res) => {
    const mountDir = this.config.get<string>('mountDir');
    const folderPath = path.join(mountDir, '3D_data','1b');

    try {
        const folderContent = await this.dirOperations.getDirectoryContent(folderPath);
       
        const dirContentArray: IFile[] = folderContent.map(entry => {
        const filePathEncrypted = encryptPath(path.resolve(folderPath, entry.name));
        const fileFromEntry: IFile = {id: filePathEncrypted, name: entry.name, isDir: entry.isDirectory()};

        return fileFromEntry;
      })

      const dirContentMap = filesArrayToMapObject(dirContentArray);


      res.send(dirContentMap);
    } catch (e) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error: (e as Error).message});
    }
  };
}
