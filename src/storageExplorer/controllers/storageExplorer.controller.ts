import { Logger } from '@map-colonies/js-logger';
import { Meter } from '@map-colonies/telemetry';
import { BoundCounter } from '@opentelemetry/api-metrics';
import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { SERVICES } from '../../common/constants';
import IFile from '../models/file.model';
import IFileMap from '../models/fileMap.model';
import { StorageExplorerManager } from '../models/storageExplorerManager';

// --  Both request should get path string, defaulted by mountDir -- 

// Should return a single File (?)
type GetFileHandler = RequestHandler<undefined, string, IFile>;

// Should return FileMap ( directory content )
type GetFolderHandler = RequestHandler<undefined, string, IFileMap<IFile>>;


@injectable()
export class StorageExplorerController {
  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(StorageExplorerManager) private readonly manager: StorageExplorerManager,
    @inject(SERVICES.METER) private readonly meter: Meter
  ) {}

  public getFile: GetFileHandler = (req, res) => {
      // Get file logic
  };

  public getFolder: GetFolderHandler = (req, res) => {
      // Get folder logic
  };
}
