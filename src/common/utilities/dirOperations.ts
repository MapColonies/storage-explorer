import { promises as fsPromises, Dirent,PathLike,constants } from 'fs';

import { singleton } from "tsyringe";


@singleton()
class DirOperations {

    private readonly fileNotFoundErr:Error = new Error("No such file or directory");
    private readonly errorOpeningFile:Error = new Error("There was a problem reading this file or directory");

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

    public async getFileContent(path: PathLike): Promise<Buffer> {
        return new Promise((resolve, reject)=> {

            fsPromises.access(path ,constants.F_OK).catch(() => reject(this.fileNotFoundErr));

            fsPromises.readFile(path).then((fileBuffer: Buffer) => {
                resolve(fileBuffer);

            }).catch(() => {
                reject(this.errorOpeningFile);
            });
        })
    }
}

export default DirOperations