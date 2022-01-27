import path from 'path';
import { Logger } from '@map-colonies/js-logger';
import { Meter } from '@map-colonies/telemetry';
import { RequestHandler, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IConfig } from 'config';
import { SERVICES } from '../../common/constants';
import IFile from '../models/file.model';
import IFileMap from '../models/fileMap.model';
import { StorageExplorerManager } from '../models/storageExplorerManager';
import { decryptPath, DirOperations, encryptPath, filesArrayToMapObject } from '../../common/utilities';
import { IStream } from '../../common/interfaces';
import { InternalServerError } from '../../common/exceptions/http/internalServerError';

// Should return file content by its id
type GetFileByIdHandler = RequestHandler<undefined, undefined, undefined, { id: string }>;

// Should return file content by its id
type GetFileHandler = RequestHandler<undefined, undefined, undefined, { pathSuffix: string }>;

// Should return FileMap ( directory content )
type GetDirectoryHandler = RequestHandler<undefined, {data: IFileMap<IFile>}, undefined, { pathSuffix: string }>;

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

  public getFile: GetFileHandler = (req, res, next) => {
    try {
      const mountDir = this.config.get<string>('mountDir');
      const pathSuffix: string = req.query.pathSuffix;
      const filePath = path.join(mountDir, pathSuffix);
      this.sendStream(res, "getFile", filePath)
    } catch (e) {
      next(e)
    }
  };

  public getFileById: GetFileByIdHandler = (req, res, next) => {
    try {
      const fileId: string = req.query.id;
      const pathDecrypted = decryptPath(fileId);
      this.sendStream(res, "getFileById", pathDecrypted)
    } catch (e) {
      next(e)
    }
  };

  // TODO: Add getdirectoryById;

  public decryptId: DecryptIdHandler = (req, res, next) => {
    try {
      const encryptedId: string = req.query.id;
      const pathDecrypted = decryptPath(encryptedId);
      res.send({data: pathDecrypted});
    } catch (e) {
      next(e)
    }
  };

  public getDirectory: GetDirectoryHandler = async (req, res, next) => {
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
      next(e)
    }
  };


    private sendStream(res: Response, controllerName: string, filePath: string): void {
      const {stream, contentType, size, name}: IStream = this.dirOperations.getJsonFileStream(filePath);
      
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Length", size);
      
      stream.pipe(res);
      stream.on("open", () => {
        this.logger.info(`[StorageExplorerController][${controllerName}] Starting to stream file: ${name} `)
      })
      stream.on("end", () => {
        this.logger.info(`[StorageExplorerController][${controllerName}] Successfully streamed file: ${name}`)
      })
      stream.on("error", (error) => {
        this.logger.error(`[StorageExplorerController][${controllerName}] failed to stream file: ${name}. error: ${error.message}`)
        throw new InternalServerError(error);
      })
    }
  


}
