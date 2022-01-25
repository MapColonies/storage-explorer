import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { StorageExplorerController } from '../controllers/storageExplorer.controller';

const storageExplorerRouterFactory: FactoryFunction<Router> = (dependencyContainer) => {
  const router = Router();
  const controller = dependencyContainer.resolve(StorageExplorerController);

  router.get('/folder', controller.getFolder);
  router.get('/file', controller.getFile);
  router.get('/filebyid', controller.getFileContentById);

  return router;
};

export const STORAGE_EXPLORER_ROUTER_SYMBOL = Symbol('storageExplorerRouterFactory');

export { storageExplorerRouterFactory };
