import * as vscode from 'vscode';
import { ModTree } from './mod-tree';
import { checkGo, openExplorer, openResource } from './utils';
import ExpanderProvider from './expander';
import { execSync } from 'child_process';

let mt: ModTree;

export function activate(context: vscode.ExtensionContext) {
  checkGo();

  mt = new ModTree(context);
  mt.watch();
  mt.update();

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

  // golang languages selector
  let goSelector: vscode.DocumentSelector = { scheme: 'file', language: 'go' };
  // provide function
  const goProvide = new ExpanderProvider();
  vscode.languages.registerDefinitionProvider(goSelector, goProvide);
}

export function deactivate() {}
