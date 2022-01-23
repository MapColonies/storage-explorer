import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { StorageExplorerController } from '../controllers/storageExplorer.controller';

const storageExplorerRouterFactory: FactoryFunction<Router> = (dependencyContainer) => {
  const router = Router();
  const controller = dependencyContainer.resolve(StorageExplorerController);

  router.get('/getFile', controller.getFile);
  router.get('/getFolder', controller.getFolder);

  return router;
};

export const STORAGE_EXPLORER_ROUTER_SYMBOL = Symbol('storageExplorerRouterFactory');

export { storageExplorerRouterFactory };
