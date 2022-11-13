import { ModItem, ModTree } from './modTree';
import { commands, ExtensionContext, Uri, window, ViewColumn } from 'vscode';
import { checkGo, openExplorer, openResource, findInFiles, delayLoad } from './utils';
import { goModTidy } from './api';

let mt: ModTree;

export function activate(context: ExtensionContext) {
  // focus to gomod explorer
  commands.registerCommand('gomod.focus', () => {
    mt.focus();
  });
  // blur and back to the previous(editor area) focus position.
  commands.registerCommand('gomod.blur', () => {
    commands.executeCommand('workbench.view.explorer');
  });
  commands.registerCommand('gomod.collapse', (resource) => {
    mt.collapse();
  });
  commands.registerCommand('gomod.openResource', (resource) => openResource(resource));
  commands.registerCommand('gomod.openInFileExplorer', (resource) => openExplorer(resource));
  commands.registerCommand('gomod.findInFiles', (resource: ModItem) => {
    findInFiles(resource.resourceUri);
  });
  commands.registerCommand('gomod.openGoModFile', (resource: ModItem) => {
    if (resource._modObject?.GoMod !== undefined) {
      openResource(Uri.parse(resource._modObject.GoMod));
    }
  });

  commands.registerCommand('gomod.execGoModTidy', (mod: ModItem) => {
    goModTidy(mod._modObject?.Dir, mod._modObject?.Path)
      .then((msg) => {
        console.log(msg);
      })
      .catch((reason) => {
        console.log(reason);
      });
  });

  // We need to wait for Extension "Go or Go-Nightly" to
  // start first in order to get the correct go envs.
  delayLoad(() => {
    checkGo();

    mt = new ModTree(context);
    mt.watch();
  });
}

export function deactivate() {}
