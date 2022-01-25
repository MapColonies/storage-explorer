import { promises as fsPromises, Dirent,PathLike,constants } from 'fs';

import { singleton } from "tsyringe";


@singleton()
class DirOperations {

    private readonly fileNotFoundErr:Error = new Error("No such file or directory");
    private readonly errorOpeningFile:Error = new Error("There was a problem opening this file or directory");

    public async getDirectoryContent(path: PathLike): Promise<Dirent[]> {
        return new Promise((resolve, reject)=> {
            fsPromises.access(path,constants.F_OK).catch(() => reject(this.fileNotFoundErr));

            fsPromises.readdir(path, {withFileTypes: true}).then((dirent: Dirent[]) => {
                resolve(dirent);
            }).catch(() => {
                reject(this.errorOpeningFile);
            });
        })
    }

    public async getFileContent(path: PathLike | Buffer): Promise<Buffer> {
        return new Promise((resolve, reject)=> {
           
            let pathString;
            if (path instanceof Buffer) {
              pathString = path.toString('utf-8');
            } else {
              pathString = path;
            }

            fsPromises.access(pathString ,constants.F_OK).catch(() => reject(this.fileNotFoundErr));

            fsPromises.readFile(pathString).then((fileBuffer: Buffer) => {
                resolve(fileBuffer);

            }).catch(() => {
                reject(this.errorOpeningFile);
            });
        })
    }
}

export default DirOperations