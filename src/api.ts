import { ModObject } from './file';
import { execSync } from 'child_process';
import { window, StatusBarAlignment } from 'vscode';
import { time } from 'console';
import { OutgoingMessage } from 'http';

/**
 * Execute `go mod tidy` command on the target module.
 *
 * *Note* Tidy may trigger explorer view update.
 *
 * @param path the root path of dst(go.mod) file
 *
 * @returns The result about the `go mod tidy`.
 */
export function goModTidy(path: string | undefined, name: string | undefined): Promise<string> {
  let _tidyStatus = window.createStatusBarItem(StatusBarAlignment.Left);
  _tidyStatus.text = '$(loading~spin) Go Mod Tidy: ' + (name === undefined ? 'error moudule' : name);
  _tidyStatus.show();

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (path === undefined) {
        _tidyStatus.hide();
        return reject('command execution failed with undefined path');
      }
      const commandStr = 'go mod tidy';

      let s = '';
      try {
        s = execSync(commandStr, { encoding: 'utf-8', cwd: path });
        _tidyStatus.hide();
        resolve('tidy done: ' + path);
      } catch (error) {
        _tidyStatus.hide();
        return reject('command execution failed: ' + s);
      }
    }, 200);
  });
}

/**
 * The execution path of query depends on the goroot set by go ext.
 *
 * *Note* that the environment of go is determined by goroot.
 *
 * @returns The information about the go environment.
 */
export function queryGoSDK(): ModObject | null {
  let s = '';
  const commandStr = process.platform === 'win32' ? 'go.exe env' : 'go env';
  try {
    s = execSync(commandStr, { encoding: 'utf-8' });
  } catch (error) {
    console.log('queryGoSDK error: ', error);
    return null;
  }

  let arg0 = s.match('(?<=(GOVERSION=)).+');
  let arg1 = s.match('(?<=(GOROOT=)).+');
  let arg2 = s.match('(?<=(GOARCH=)).+');
  let arg3 = s.match('(?<=(GOHOSTOS=)).+');

  // sub the "" for environment values on linux/mac
  // the version of a custom build may be unknown
  // version format as x.x(-hash10) (time)
  let version =
    arg0?.length === 2
      ? process.platform === 'win32'
        ? arg0[0]
        : arg0[0].substring(1, arg0[0].length - 1)
      : 'unknown';
  let goRoot =
    arg1?.length === 2
      ? process.platform === 'win32'
        ? arg1[0]
        : arg1[0].substring(1, arg1[0].length - 1)
      : 'unknown';

  let arch =
    arg2?.length === 2
      ? process.platform === 'win32'
        ? arg2[0]
        : arg2[0].substring(1, arg2[0].length - 1)
      : 'unknown';

  let platform =
    arg3?.length === 2
      ? process.platform === 'win32'
        ? arg3[0]
        : arg3[0].substring(1, arg3[0].length - 1)
      : 'unknown';

  let gI = version?.indexOf('go');
  if (gI !== -1) {
    version = version.substring(gI + 2);
  }

  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Arch: arch,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Platform: platform,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Dir: goRoot,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    GoMod: '',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    GoVersion: version,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Main: true, // We treat go sdk as a module, so main = true
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Path: '',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Version: '',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    SDK: true,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Indirect: false,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Time: '',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Replace: undefined,
  };
}
