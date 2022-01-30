import IFile from "../../../../src/storageExplorer/models/file.model";
import IFileMap from "../../../../src/storageExplorer/models/fileMap.model";

export class FileMap implements IFileMap<IFile> {
    [fieldId: string]: IFile; 
}