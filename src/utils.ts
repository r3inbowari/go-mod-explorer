import { exec, execSync } from 'child_process';
import { Uri, workspace, window, commands } from 'vscode';
import { ModObject } from './file';

const fs = require('fs');
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

// if *.get() return an undefined str, a defealt "go" command will be replaced.
export function queryGoSDK(): ModObject | null {
  let s = '';
  const exe = process.platform === 'win32' ? 'go.exe env' : 'go env';
  try {
    s = execSync(cdGO() + exe, { encoding: 'utf-8' });
  } catch (error) {
    return null;
  }
  let ret: ModObject;

  let arg0 = s.match('(?<=(GOVERSION=)).+');
  let arg1 = s.match('(?<=(GOROOT=)).+');

  let version = arg0?.length === 2 ? arg0[0] : 'unknown';
  let goRoot = arg1?.length === 2 ? arg1[0] : 'unknown';

  // do somethings with linux/max
  if (process.platform !== 'win32') {
    version = version.substring(1, version.length - 1);
    goRoot = goRoot.substring(1, goRoot.length - 1);
  }

  // The version number of a custom build may be unknown
  let gI = version?.indexOf('go');
  if (arg0?.length === 2 && gI !== -1) {
    version = version.substring(gI + 2);
  }

  return {
    Dir: goRoot,
    GoMod: '',
    GoVersion: version,
    Main: false,
    Path: '',
    Version: '',
    SDK: true,
    Indirect: false,
  };
}

export function checkGo() {
  let command = cdGO() + 'go version';
  exec(command, (error, stdout, stderr) => {
    if (error !== null) {
      window
        .showErrorMessage('The "go" command is not available. Run "go version" on your terminal to check.', 'Restart')
        .then((selected) => {
          switch (selected) {
            case 'Restart':
              commands.executeCommand('workbench.action.reloadWindow');
          }
        });
    }
  });
  return false;
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
export function findInFiles(res: any): void {
  let p = resolvePath(res.resource);
  commands.executeCommand('workbench.action.findInFiles', {
    query: '',
    isRegex: true,
    triggerSearch: true,
    focusResults: true,
    filesToExclude: '',
    filesToInclude: p,
  });
}
