import jsLogger from '@map-colonies/js-logger';
import { trace } from '@opentelemetry/api';
import httpStatusCodes from 'http-status-codes';
import { getApp } from '../../../src/app';
import { SERVICES } from '../../../src/common/constants';
import { StorageExplorerRequestSender } from './helpers/requestSender';

describe('resourceName', function () {
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

  describe('given invalid params', function () {
    // All requests with status code of 400
    describe('directory', () => {
      it('should return 400 if path not found',async ()=>{
        const { status } = await requestSender.getDirectory('3D_data/2b/3b');
        expect(status).toBe(httpStatusCodes.NOT_FOUND);
      })

      it('should return 400 if a file path supplied',async ()=>{
        const { status } = await requestSender.getDirectory('3D_data/2b/metadata.json');
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
    });

  });


  describe('given invalid inner explorer route', function () {
    // All requests with status code 4XX-5XX
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
