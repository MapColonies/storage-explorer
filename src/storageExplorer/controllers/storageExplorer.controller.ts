import path from 'path';
import { Logger } from '@map-colonies/js-logger';
import { Meter } from '@map-colonies/telemetry';
import { BoundCounter } from '@opentelemetry/api-metrics';
import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { IConfig } from 'config';
import { SERVICES } from '../../common/constants';
import IFile from '../models/file.model';
import IFileMap from '../models/fileMap.model';
import { StorageExplorerManager } from '../models/storageExplorerManager';
import { DirOperations, filesArrayToMapObject } from '../../common/utilities'


// --  Both request should get path string, defaulted by mountDir --

// Should return a single File (?)
type GetFileHandler = RequestHandler<undefined, IFile, string>;

// Should return FileMap ( directory content )
type GetFolderHandler = RequestHandler<undefined, IFileMap<IFile> | Error, string>;

// For metadata.json files.
type GetFileContent = RequestHandler<undefined, JSON, string>;

@injectable()
export class StorageExplorerController {
  public constructor(
    @inject(SERVICES.LOGGER) private readonly logger: Logger,
    @inject(StorageExplorerManager) private readonly manager: StorageExplorerManager,
    @inject(SERVICES.METER) private readonly meter: Meter,
    @inject(SERVICES.CONFIG) private readonly config: IConfig,
    private readonly dirOperations: DirOperations
  ) {}

  public getFile: GetFileHandler = (req, res) => {
    // Get file logic
  };

  public getFileContent: GetFileContent = (req, res) => {
    // Get file content logic
  };

  public getFolder: GetFolderHandler = async (req, res) => {
    const mountDir = this.config.get<string>('mountDir');
    const folderPath = path.join(mountDir, '3D_data','1b');

    try {
      const folderContent = await this.dirOperations.getDirectoryContent(folderPath);
      
      const dirContentArray: IFile[] = folderContent.map(entry=>{
        const filePathBufferHex = Buffer.from(path.resolve(mountDir, entry.name),'utf-8').toString('hex');

        const fileFromEntry: IFile = {id: filePathBufferHex,name:entry.name, isDir: entry.isDirectory()};
        
        return fileFromEntry;
      })

      const dirContentMap = filesArrayToMapObject(dirContentArray);


      res.send(dirContentMap);
    } catch (e) {
      res.status(httpStatus.BAD_REQUEST).send(new Error(e as string));
    }
  };
}
