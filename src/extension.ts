import { ModItem, ModTree } from './modTree';
import { commands, ExtensionContext, Uri } from 'vscode';
import { checkGo, openExplorer, openResource, findInFiles, delayLoad } from './utils';

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
  commands.registerCommand('gomod.openByFileExplorer', (resource) => openExplorer(resource));
  commands.registerCommand('gomod.findInFiles', (resource) => {
    findInFiles(resource);
    // vscode.commands.executeCommand('search.action.openNewEditor', 'C:\\Users\\inven\\Desktop\\common\\fs.go');
  });
  commands.registerCommand('gomod.openGoModFile', (resource: ModItem) => {
    if (resource._modObject?.GoMod !== undefined) {
      openResource(Uri.parse(resource._modObject.GoMod));
    }
  });

  // We need to wait for Extension "Go or Go-Nightly" to
  // start first in order to get the correct go envs.
  delayLoad(() => {
    checkGo();

    mt = new ModTree(context);
    mt.watch();
    mt.updateAll();
  });
}

export function deactivate() {}
