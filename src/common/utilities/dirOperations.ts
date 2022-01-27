import { promises as fsPromises, Dirent,PathLike, constants as fsConstants, createReadStream, statSync, existsSync } from 'fs';
import { default as Path } from 'path'
import { Logger } from '@map-colonies/js-logger';
import { inject, injectable, singleton } from "tsyringe";
import { SERVICES } from '../constants';
import { BadRequestError } from '../exceptions/http/badRequestError';
import { NotFoundError } from '../exceptions/http/notFoundError';
import { IStream } from '../interfaces';
import { InternalServerError } from '../exceptions/http/internalServerError';

@injectable()
@singleton()
class DirOperations {
  private readonly fileNotFoundErr = 'No such file or directory';
  private readonly fileTypeNotSupported = 'File type is not supported';
  private readonly couldNotCreateStream = 'Error creating a stream for the requested file';
  private readonly pathIsNotDir = 'Path is not a directory';

  public constructor(@inject(SERVICES.LOGGER) private readonly logger: Logger){}
  
  
  public async getDirectoryContent(path: PathLike): Promise<Dirent[]> {
    this.logger.info(`[DirOperations][getDirectoryContent] checking if directory of path ${path as string} exists`)
    const isDirExists = existsSync(path);

    if (!isDirExists) {
      this.logger.error(`[DirOperations][getDirectoryContent] directory of path ${path as string} does not exist`)
      throw new NotFoundError(this.fileNotFoundErr);
    }

    this.logger.info(`[DirOperations][getDirectoryContent] checking if path ${path as string} is a directory`)
    const isDir = statSync(path).isDirectory();

    if(!isDir){
      this.logger.error(`[DirOperations][getDirectoryContent] path ${path as string} is not a directory`)
      throw new BadRequestError(this.pathIsNotDir);
    }
    
    return fsPromises.readdir(path, { withFileTypes: true });
  }

  public getJsonFileStream(path: PathLike): IStream {
    this.logger.info(`[DirOperations][getJsonFileStream] checking if file of path ${path as string} exists`)
    const isFileExists = existsSync(path);
    
    if (!isFileExists) {
        this.logger.error(`[DirOperations][getJsonFileStream] file of path ${path as string} does not exist`)
        throw new NotFoundError(this.fileNotFoundErr);
    }

    this.logger.info(`[DirOperations][getJsonFileStream] checking if file of path ${path as string} is a JSON`)
    const isJson = Path.extname(path as string) === '.json';

    if(!isJson){
        this.logger.error(`[DirOperations][getJsonFileStream] checking if file of path ${path as string} is not a JSON`)
        throw new BadRequestError(this.fileTypeNotSupported);;
    }

    try {
        this.logger.info(`[DirOperations][getJsonFileStream] creating a stream for file at ${path as string}`)
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