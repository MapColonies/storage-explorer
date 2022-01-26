import { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import { SERVICES } from '../../common/constants';
import IFile from './file.model';
import IFileMap from './fileMap.model';



@injectable()
export class StorageExplorerManager {
  public constructor(@inject(SERVICES.LOGGER) private readonly logger: Logger) {}
}
