/* eslint-disable @typescript-eslint/no-misused-promises */
import { Dirent, ReadStream } from 'fs';
import jsLogger from '@map-colonies/js-logger';
import config from 'config';
import { BadRequestError, NotFoundError, InternalServerError } from '@map-colonies/error-types';
import { DirOperations } from '../../../../src/common/utilities';
import { fileStreamSnap, generateRootDirSnap } from '../snapshots';
import { streamToString } from '../utils';

let dirOperations: DirOperations;
describe('storage explorer dirOperations', () => {
  beforeEach(function () {
    dirOperations = new DirOperations(jsLogger({ enabled: false }), config);
  });

  describe('#getPhysicalPath', () => {
    it('should return correct physical path mapped from config', () => {
      const displayPath = '/\\\\First_mount_dir/3D_data/1b/product.json';
      const mappedPath = dirOperations.getPhysicalPath(displayPath);
      const expectedVal = './MOCKS/3D_data/1b/product.json';
      expect(mappedPath).toBe(expectedVal);
    });

    it('should throw an error for invalid path', () => {
      const invalidPath = '../'; // starts with a dot
      const physicalPathError = () => {
        return dirOperations.getPhysicalPath(invalidPath);
      };

      expect(physicalPathError).toThrow(BadRequestError);
      expect(physicalPathError).toThrow('Invalid path');
    });
  });

  describe('#generateRootDir', () => {
    it('should return "virtual" root dir with all mountDirs from config', () => {
      const rootDir = dirOperations.generateRootDir();
      const expectedVal = generateRootDirSnap;
      expect(rootDir).toMatchObject(expectedVal);
    });
  });

  describe('#getDirectoryContent', () => {
    it('should return Dirent content', async () => {
      const dirPath = './MOCKS/3D_data/1b';
      const dirent = await dirOperations.getDirectoryContent(dirPath);
      expect(dirent).toEqual(expect.arrayContaining<Dirent>(dirent));
      expect(dirent[0]).toHaveProperty('name');
      expect(dirent[0].name).toBe('metadata.json');
    });

    it('should throw an error if dir not exists', async () => {
      const notExistsPath = './MOCKS/3D_data/1b/3b';

      await expect(dirOperations.getDirectoryContent(notExistsPath)).rejects.toThrow(NotFoundError);
      await expect(dirOperations.getDirectoryContent(notExistsPath)).rejects.toThrow('No such file or directory');
    });

    it('should throw an error if path is not a dir', async () => {
      const filePath = './MOCKS/3D_data/1b/metadata.json';

      await expect(dirOperations.getDirectoryContent(filePath)).rejects.toThrow(BadRequestError);
      await expect(dirOperations.getDirectoryContent(filePath)).rejects.toThrow('Path is not a directory');
    });
  });

  describe('#getJsonFileStream', () => {
    it('should return IStream object with file content as a ReadStream', async () => {
      const filePath = './MOCKS/3D_data/1b/product.json';
      const fileStream = dirOperations.getJsonFileStream(filePath);

      expect(fileStream).toHaveProperty('stream');
      expect(fileStream).toHaveProperty('contentType');
      expect(fileStream).toHaveProperty('size');
      expect(fileStream).toHaveProperty('name');
      expect(fileStream.stream).toBeInstanceOf(ReadStream);

      const fileContent = await streamToString(fileStream.stream);
      expect(JSON.parse(fileContent)).toMatchObject(fileStreamSnap);
    });

    it('should throw an error if file not exists', () => {
      const notExistsPath = './MOCKS/3D_data/1b/product_not_exist.json';

      const fileStreamError = () => {
        return dirOperations.getJsonFileStream(notExistsPath);
      };

      expect(fileStreamError).toThrow(NotFoundError);
      expect(fileStreamError).toThrow('No such file or directory');
    });

    it('should throw an error if path is not a JSON file', () => {
      const nonJsonPath = './MOCKS/3D_data/1b/text.txt';

      const fileStreamError = () => {
        return dirOperations.getJsonFileStream(nonJsonPath);
      };

      expect(fileStreamError).toThrow(BadRequestError);
      expect(fileStreamError).toThrow('File type is not supported');
    });
  });
});
