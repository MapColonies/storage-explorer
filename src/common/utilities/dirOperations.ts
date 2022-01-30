import { promises as fsPromises, Dirent,PathLike, createReadStream, statSync, existsSync } from 'fs';
import { default as Path } from 'path'
import { Logger } from '@map-colonies/js-logger';
import { inject, injectable, singleton } from "tsyringe";
import { SERVICES } from '../constants';
import { BadRequestError } from '../exceptions/http/badRequestError';
import { NotFoundError } from '../exceptions/http/notFoundError';
import { IConfig, ImountDirObj, IStream } from '../interfaces';
import { InternalServerError } from '../exceptions/http/internalServerError';
import IFileMap from '../../storageExplorer/models/fileMap.model';
import IFile from '../../storageExplorer/models/file.model';
import { encryptPath, filesArrayToMapObject } from '.';

@injectable()
@singleton()
class DirOperations {
  private readonly fileNotFoundErr = 'No such file or directory';
  private readonly fileTypeNotSupported = 'File type is not supported';
  private readonly couldNotCreateStream = 'Error creating a stream for the requested file';
  private readonly pathIsNotDir = 'Path is not a directory';

  public constructor(@inject(SERVICES.LOGGER) private readonly logger: Logger,
                     @inject(SERVICES.CONFIG) private readonly config: IConfig){}

  // get physical name or regular name
  public getPhysicalPath(path: string): string {
    
    const mountDirectories = this.config.get<ImountDirObj[]>('mountDirs');
    const selectedDir = mountDirectories.find((mountDir) => path.startsWith(`/${mountDir.displayName}`));
    
    if(selectedDir){
      const physicalPath = path.replace(`/${selectedDir.displayName}`, selectedDir.physical);
      return physicalPath;
    }

    return path;
  }
  
  public generateRootDir(): IFileMap<IFile> {
    this.logger.info("[DirOperations][generateRootDir] generating mounts root dir.")
    const mountDirectories = this.config.get<ImountDirObj[]>('mountDirs');

    const mountFilesArr = mountDirectories.map((mountDir)=> {
      const fileFromMountDir: IFile = {
        id: encryptPath(mountDir.physical),
        name: mountDir.displayName,
        isDir: true,
        parentId: encryptPath('/'),
      };

      return fileFromMountDir;
    })

    return filesArrayToMapObject(mountFilesArr);

  }
  
  public async getDirectoryContent(path: PathLike): Promise<Dirent[]> {
    this.logger.info(`[DirOperations][getDirectoryContent] fetching directory of path ${path as string}`)
    const isDirExists = existsSync(path);

    if (!isDirExists) {
      throw new NotFoundError(this.fileNotFoundErr);
    }

    const isDir = statSync(path).isDirectory();

    if(!isDir){
      throw new BadRequestError(this.pathIsNotDir);
    }
    
    return fsPromises.readdir(path, { withFileTypes: true });
  }

  public getJsonFileStream(path: PathLike): IStream {
    this.logger.info(`[DirOperations][getJsonFileStream] fetching file at path ${path as string}`)
    const isFileExists = existsSync(path);
    
    if (!isFileExists) {
        throw new NotFoundError(this.fileNotFoundErr);
    }

    const isJson = Path.extname(path as string) === '.json';

    if(!isJson){
        throw new BadRequestError(this.fileTypeNotSupported);;
    }

    try {
        const stream = createReadStream(path);
        const { size } = statSync(path);
        const fileName = Path.basename(path as string)
        
        const streamProduct: IStream = {
            stream,
            contentType: 'application/json',
            size,
            name: fileName,
        }
        
        return streamProduct;
    }catch(e){
        this.logger.error(`[DirOperations][getJsonFileStream] could not create a stream for file at ${path as string}. error=${(e as Error).message}`)
        throw new InternalServerError(this.couldNotCreateStream)
    }
    
  }
}

export default DirOperations