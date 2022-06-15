import { Uri } from 'vscode';

export class CacheItem {
  private path: Uri;
  private prev: string;

  constructor(path: Uri) {
    this.path = path;
    this.prev = '??????';
  }
}
