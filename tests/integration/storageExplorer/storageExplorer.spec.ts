import jsLogger from '@map-colonies/js-logger';
import { trace } from '@opentelemetry/api';
import httpStatusCodes from 'http-status-codes';
import { getApp } from '../../../src/app';
import { SERVICES } from '../../../src/common/constants';
import { encryptPath } from '../../../src/common/utilities';
import { StorageExplorerRequestSender } from './helpers/requestSender';

describe('Storage Explorer', function () {
  let requestSender: StorageExplorerRequestSender;
  beforeEach(function () {
    const app = getApp({
      override: [
        { token: SERVICES.LOGGER, provider: { useValue: jsLogger({ enabled: false }) } },
        { token: SERVICES.TRACER, provider: { useValue: trace.getTracer('testTracer') } },
      ],
      useChild: true,
    });
    requestSender = new StorageExplorerRequestSender(app);
  });

  // describe('given valid params', ()=> {
  //   describe('directory', () => {
  //       it('should return 200 and data of type FileMap<IFile>', async () => {

  //       })
  //   });

  //   describe('file', () => {
  //     it('should return 400 if path not found',async ()=>{
  //       const { status } = await requestSender.getFile('3D_data/2b/not_there.json');
  //       expect(status).toBe(httpStatusCodes.NOT_FOUND);
  //     })

  //     it('should return 400 if file is not a JSON',async ()=>{
  //       const { status } = await requestSender.getFile('3D_data/1b/text.txt');
  //       expect(status).toBe(httpStatusCodes.BAD_REQUEST);
  //     })

  //     it('should return 400 if required query not provided', async () => {
  //       const { status } = await requestSender.getFileWithoutQuery();
  //       expect(status).toBe(httpStatusCodes.BAD_REQUEST);
  //     })
  //   });

  //   describe('file by id', () => {
  //     it('should return 500 if id is not valid',async ()=>{
  //       const { status } = await requestSender.getFileById('iYl0xZ28wqXUIZ_pP_XU0v0i0EhFUpjD1QzJQsD7hO9.dPkcbmbb4pbPjUyek6');
  //       expect(status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
  //     })

  //     it('should return 400 if file is not a JSON',async ()=>{
  //       const encryptedNotJsonPath = encryptPath('MOCKS/3D_data/1b/text.txt')
  //       const { status } = await requestSender.getFileById(encryptedNotJsonPath);
  //       expect(status).toBe(httpStatusCodes.BAD_REQUEST);
  //     })

  //     it('should return 400 if required query not provided', async () => {
  //       const { status } = await requestSender.getFileByIdWithoutQuery();
  //       expect(status).toBe(httpStatusCodes.BAD_REQUEST);
  //     })
  //   });

  //   describe('decrypt id', () => {
  //     it('should return 500 if id is not valid',async ()=>{
  //       const { status } = await requestSender.getDecryptedId('iYl0xZ28wqXUIZ_pP_XU0v0i0EhFUpjD1QzJQsD7hO9.dPkcbmbb4pbPjUyek6');
  //       expect(status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
  //     })

  //     it('should return 400 if required query not provided', async () => {
  //       const { status } = await requestSender.getDecryptedIdWithoutQuery();
  //       expect(status).toBe(httpStatusCodes.BAD_REQUEST);
  //     })
  //   });
  // })



  describe('given invalid params', () => {
    describe('directory', () => {
      it('should return 400 if path not found',async ()=>{
        const { status } = await requestSender.getDirectory('3D_data/2b/3b');
        expect(status).toBe(httpStatusCodes.NOT_FOUND);
      })

      it('should return 400 if a file path supplied',async ()=>{
        const { status } = await requestSender.getDirectory('3D_data/2b/metadata.json');
        expect(status).toBe(httpStatusCodes.BAD_REQUEST);
      })

      it('should return 400 if required query not provided', async () => {
        const { status } = await requestSender.getDirectoryWithoutQuery();
        expect(status).toBe(httpStatusCodes.BAD_REQUEST);
      })
    });

    describe('file', () => {
      it('should return 400 if path not found',async ()=>{
        const { status } = await requestSender.getFile('3D_data/2b/not_there.json');
        expect(status).toBe(httpStatusCodes.NOT_FOUND);
      })

      it('should return 400 if file is not a JSON',async ()=>{
        const { status } = await requestSender.getFile('3D_data/1b/text.txt');
        expect(status).toBe(httpStatusCodes.BAD_REQUEST);
      })

      it('should return 400 if required query not provided', async () => {
        const { status } = await requestSender.getFileWithoutQuery();
        expect(status).toBe(httpStatusCodes.BAD_REQUEST);
      })
    });

    describe('file by id', () => {
      it('should return 500 if id is not valid',async ()=>{
        const { status } = await requestSender.getFileById('iYl0xZ28wqXUIZ_pP_XU0v0i0EhFUpjD1QzJQsD7hO9.dPkcbmbb4pbPjUyek6');
        expect(status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
      })

      it('should return 400 if file is not a JSON',async ()=>{
        const encryptedNotJsonPath = encryptPath('MOCKS/3D_data/1b/text.txt')
        const { status } = await requestSender.getFileById(encryptedNotJsonPath);
        expect(status).toBe(httpStatusCodes.BAD_REQUEST);
      })

      it('should return 400 if required query not provided', async () => {
        const { status } = await requestSender.getFileByIdWithoutQuery();
        expect(status).toBe(httpStatusCodes.BAD_REQUEST);
      })
    });

    describe('decrypt id', () => {
      it('should return 500 if id is not valid',async ()=>{
        const { status } = await requestSender.getDecryptedId('iYl0xZ28wqXUIZ_pP_XU0v0i0EhFUpjD1QzJQsD7hO9.dPkcbmbb4pbPjUyek6');
        expect(status).toBe(httpStatusCodes.INTERNAL_SERVER_ERROR);
      })

      it('should return 400 if required query not provided', async () => {
        const { status } = await requestSender.getDecryptedIdWithoutQuery();
        expect(status).toBe(httpStatusCodes.BAD_REQUEST);
      })
    });

  });


  describe('given invalid inner explorer route', function () {
    it('should return 404', async () => {
      const { status } = await requestSender.getNoValidRoute();
      expect(status).toBe(httpStatusCodes.NOT_FOUND);
    })

    it('should also return 404 for main route', async () => {
      const { status } = await requestSender.getNoValidUrl();
      expect(status).toBe(httpStatusCodes.NOT_FOUND);
    })
  });
});
