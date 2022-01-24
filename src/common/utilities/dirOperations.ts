import { promises as fsPromises, Dirent,PathLike,constants } from 'fs';

import { singleton } from "tsyringe";


@singleton()
class DirOperations {

    public async getDirectoryContent(path: PathLike): Promise<Dirent[]> {
        return new Promise((resolve, reject)=> {
            fsPromises.access(path,constants.F_OK).catch(e => reject(e));

            fsPromises.readdir(path, {withFileTypes: true}).then((dirent: Dirent[]) => {
                resolve(dirent)
            }).catch(e => {
                reject(e)
            });
        })
    }
}

export default DirOperations