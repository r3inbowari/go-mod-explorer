import { exec, execSync } from 'child_process';
import { clear } from 'console';
import { win32 } from 'path';
import { Uri, workspace, window, commands, extensions } from 'vscode';
import { ModObject } from './file';

const fs = require('fs');
const path = require('path');
const _openExplorer = require('open-file-explorer');

export function openExplorer(res: any) {
  let p = resolvePath(res.resourceUri);
  let stat = fs.lstatSync(p);

  if (stat.isFile()) {
    // trim right in order to get parent
    // node relative to the current file.
    p = getParentNode(p);
  }
  _openExplorer(p, (err: any) => {
    if (err) {
      console.log(err);
    }
  });
}

export function openResource(resource: Uri): void {
  if (process.platform === 'win32') {
    window.showTextDocument(Uri.file(resource.toString(true)));
  } else {
    window.showTextDocument(Uri.parse(resource.toString(true)));
  }
}

export function parseChildURI(parent: Uri, childName: string): Uri {
  return process.platform === 'win32'
    ? Uri.parse(parent.toString(true) + '\\' + childName)
    : Uri.parse(parent.toString(true) + '/' + childName);
}

// resolve the file system path in different operating system
export function resolvePath(resource: Uri): string {
  return process.platform === 'win32' ? resource.toString(true) : resource.path;
}

export function getParentNode(path: string): string {
  let n = process.platform === 'win32' ? path.lastIndexOf('\\') : path.lastIndexOf('/');
  return path.substring(0, n);
}

export function cdGO(): string {
  const workSpaceConfig = workspace.getConfiguration('go');
  const slash = process.platform === 'win32' ? '\\' : '/';
  return workSpaceConfig.get('goroot') !== null ? `cd ${workSpaceConfig.get('goroot')}${slash}bin &&` : '';
}

export function checkGo() {
  let command = cdGO() + 'go version';
  exec(command, (error, stdout, stderr) => {
    if (error !== null) {
      errorRestart('The "go" command is not available. Run "go version" on your terminal to check.');
    }
  });
}

export function delayLoad(active: Function) {
  let extGo =
    extensions.getExtension('golang.go-nightly') !== undefined
      ? extensions.getExtension('golang.go-nightly')
      : extensions.getExtension('golang.go');

  if (extGo === undefined) {
    errorRestart('Extension "Go" not found, please install it from the extension market.');
  } else {
    let retries = 60;
    let t = setInterval(() => {
      retries--;
      if (retries < 0) {
        clearTimeout(t);
        return;
      }
      if (extGo?.isActive) {
        clearTimeout(t);
        active();
      }
    }, 1000);
  }
}

export function errorRestart(msg: string) {
  window.showErrorMessage(msg, 'Restart').then((selected) => {
    switch (selected) {
      case 'Restart':
        commands.executeCommand('workbench.action.reloadWindow');
    }
  });
}

// ref: https://github.com/microsoft/vscode/blob/4a130c40ed876644ed8af2943809d08221375408/src/vs/workbench/contrib/searchEditor/browser/searchEditorInput.ts#L36
// export type SearchConfiguration = {
//   query: string;
//   filesToInclude: string;
//   filesToExclude: string;
//   contextLines: number;
//   matchWholeWord: boolean;
//   isCaseSensitive: boolean;
//   isRegexp: boolean;
//   useExcludeSettingsAndIgnoreFiles: boolean;
//   showIncludesExcludes: boolean;
//   onlyOpenEditors: boolean;
// };
export function findInFiles(res: Uri | undefined): void {
  if (res === undefined) {
    return;
  }
  let p = resolvePath(res);
  commands.executeCommand('workbench.action.findInFiles', {
    query: '',
    isRegex: true,
    triggerSearch: true,
    focusResults: true,
    filesToExclude: '',
    filesToInclude: p,
  });
}

export function walkSync(currentDirPath: any, callback: any) {
  var fs = require('fs'),
    path = require('path');
  fs.readdirSync(currentDirPath, { withFileTypes: true }).forEach(function (dirent: any) {
    var filePath = path.join(currentDirPath, dirent.name);
    if (dirent.isFile()) {
      callback(filePath, dirent);
    } else if (dirent.isDirectory()) {
      walkSync(filePath, callback);
    }
  });
}
