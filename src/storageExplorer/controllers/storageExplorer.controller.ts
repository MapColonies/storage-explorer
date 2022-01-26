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
type GetFileContentByIdHandler = RequestHandler<undefined, {data: JSON | string} | {error: string}, undefined, { id: string }>;

// Should return file content by its id
type GetFileHandler = RequestHandler<undefined, {data: JSON | string} | { error: string }, undefined, { pathSuffix: string }>;

// Should return FileMap ( directory content )
type GetDirectoryHandler = RequestHandler<undefined, {data: IFileMap<IFile>} | { error: string }, undefined, { pathSuffix: string }>;

// Should decrypt id to path suffix
type DecryptIdHandler = RequestHandler<undefined, {data: string} | { error: string }, undefined, { id: string }>

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
      const mountDir = this.config.get<string>('mountDir');
      const pathSuffix: string = req.query.pathSuffix;
      const filePath = path.join(mountDir, pathSuffix);
      const fileContentBuffer = await this.dirOperations.getFileContent(filePath);
      const stringContent = fileContentBuffer.toString('utf-8')

       try {
         res.send({data: JSON.parse(stringContent) as JSON});
       } catch (e) {
         res.send({data: stringContent});
       }

    } catch (e) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: (e as Error).message });
    }
  };

  public getFileContentById: GetFileContentByIdHandler = async (req, res) => {
    try {
      const fileId: string = req.query.id;
      const pathDecrypted = decryptPath(fileId);
      const fileContentBuffer = await this.dirOperations.getFileContent(pathDecrypted);
      const stringContent = fileContentBuffer.toString('utf-8')

      try {
        res.send({data: JSON.parse(stringContent) as JSON});
      } catch (e) {
        res.send({data: stringContent});
      }

    } catch (e) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: (e as Error).message });
    }
  };

  public decryptId: DecryptIdHandler = (req, res) => {
    try {
      if (typeof req.query === 'undefined' || !('id' in req.query)) {
        throw new Error('id query is mandatory!');
      }
      const encryptedId: string = req.query.id;
      const pathDecrypted = decryptPath(encryptedId);

      res.send({data: pathDecrypted});
    } catch (e) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: (e as Error).message });
    }
  };

  public getDirectory: GetDirectoryHandler = async (req, res) => {
    try {
        const mountDir = this.config.get<string>('mountDir');
        const pathSuffix: string = req.query.pathSuffix;
        const directoryPath = path.join(mountDir, pathSuffix);
        const directoryContent = await this.dirOperations.getDirectoryContent(directoryPath);

        const dirContentArray: IFile[] = directoryContent.map((entry) => {
          const filePathEncrypted = encryptPath(path.join(directoryPath, entry.name));
          const fileFromEntry: IFile = { id: filePathEncrypted, name: entry.name, isDir: entry.isDirectory() };

          return fileFromEntry;
        });

      const dirContentMap = filesArrayToMapObject(dirContentArray);

      res.send({data: dirContentMap});
    } catch (e) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ error: (e as Error).message });
    }
  };

}
