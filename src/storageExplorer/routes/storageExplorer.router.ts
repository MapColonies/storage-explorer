import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { StorageExplorerController } from '../controllers/storageExplorer.controller';

const storageExplorerRouterFactory: FactoryFunction<Router> = (dependencyContainer) => {
  const router = Router();
  const controller = dependencyContainer.resolve(StorageExplorerController);

  router.get('/directory', controller.getDirectory);
  router.get('/directorybyid', controller.getdirectoryById);
  router.get('/file', controller.getFile);
  router.get('/filebyid', controller.getFileById);
  router.get('/decryptid', controller.decryptId);

  return router;
};

export const STORAGE_EXPLORER_ROUTER_SYMBOL = Symbol('storageExplorerRouterFactory');

export { storageExplorerRouterFactory };
