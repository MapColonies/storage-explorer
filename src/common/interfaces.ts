import { ReadStream } from 'fs'

export interface IConfig {
  get: <T>(setting: string) => T;
  has: (setting: string) => boolean;
}

export interface OpenApiConfig {
  filePath: string;
  basePath: string;
  jsonPath: string;
  uiPath: string;
}

export interface IStream {
  stream: ReadStream;
  contentType: string;
  size: number;
  name: string;
}