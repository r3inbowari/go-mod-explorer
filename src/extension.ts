import * as vscode from 'vscode';
import { ModTree } from './mod-tree';
import { execSync } from 'child_process';
import { checkGo, openExplorer, openResource } from './utils';

let mt: ModTree;

export function activate(context: vscode.ExtensionContext) {
  checkGo();

  mt = new ModTree(context);
  mt.watch();
  mt.update();

  // TODO: need fixed: delay load after vscode-go
  try {
    execSync('go version');
  } catch {
    setTimeout(() => {
      mt.update();
    }, 5000);
  }

  // focus to gomod explorer
  vscode.commands.registerCommand('gomod.focus', () => {
    mt.focus();
  });
  // blur and back to the previous(editor area) focus position.
  vscode.commands.registerCommand('gomod.blur', () => {
    vscode.commands.executeCommand('workbench.view.explorer');
  });
  vscode.commands.registerCommand('gomod.expandPackageDetail', (resource) => {
    mt.hideHost();
  });
  vscode.commands.registerCommand('gomod.openResource', (resource) => openResource(resource));
  vscode.commands.registerCommand('gomod.openByFileExplorer', (resource) => openExplorer(resource));
  vscode.commands.registerCommand('gomod.findInFiles', (resource) => {
    // findInFiles(resource);
    vscode.commands.executeCommand('search.action.openNewEditor', 'C:\\Users\\inven\\Desktop\\common\\fs.go');
  });
}

export function deactivate() {}
