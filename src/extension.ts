import { ModItem, ModTree } from './modTree';
import { commands, ExtensionContext, Uri, window, ViewColumn } from 'vscode';
import { checkGo, openExplorer, openResource, findInFiles, delayLoad } from './utils';
import { goModTidy } from './api';
import * as path from 'path';

let mt: ModTree;

export function activate(context: ExtensionContext) {
  commands.registerCommand('gomod.market', () => {
    const panel = window.createWebviewPanel('GoPM', 'Go Packages Market', ViewColumn.One, {
      enableScripts: true,
      localResourceRoots: [Uri.file(path.join(context.extensionPath, 'dist'))],
    });
    const onDiskPath = Uri.file(path.join(context.extensionPath, 'dist', 'assets/index.css'));
    const onDiskPath1 = Uri.file(path.join(context.extensionPath, 'dist', 'assets/index.js'));
    const cssPath = panel.webview.asWebviewUri(onDiskPath);
    const jsPath = panel.webview.asWebviewUri(onDiskPath1);

    panel.webview.html = getWebviewContent(jsPath, cssPath);

    setTimeout(() => {
      panel.webview.postMessage({ command: 'refactor' });
    }, 10000);

    panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case 0:
            window.showErrorMessage(message.payload);
            return;
        }
      },
      undefined,
      context.subscriptions
    );
  });
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

function getWebviewContent(js: Uri, css: Uri) {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <link
        rel="icon"
        type="image"
        href="https://pkg.go.dev/static/shared/icon/favicon.ico"
      />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Go Packages</title>
      <script type="module" crossorigin src="${js}"></script>
      <link rel="stylesheet" href="${css}">
    </head>
    <body>
      <div id="app"></div>
    </body>
  </html>
  `;
}
