import { ModObject } from './file';
import { readdirSync, statSync } from 'fs';
import { queryGoSDK, parseChildURI, resolvePath } from './utils';
import { exec } from 'child_process';
import { watch } from 'fs';
import {
  Uri,
  Event,
  window,
  TreeView,
  TreeItem,
  Position,
  languages,
  workspace,
  LocationLink,
  EventEmitter,
  TextDocument,
  ProviderResult,
  DocumentSelector,
  ExtensionContext,
  TreeDataProvider,
  CancellationToken,
  DefinitionProvider,
  StatusBarAlignment,
  TreeItemCollapsibleState,
  TextDocumentContentProvider,
  Definition,
} from 'vscode';

var path = require('path');

export class ModItem extends TreeItem {
  public isDirectory: boolean = false;
  public _modObject: ModObject | undefined;

  constructor(modObject: ModObject | string | undefined, resource: Uri, isDirectory: boolean) {
    super(resource, isDirectory ? TreeItemCollapsibleState.Collapsed : void TreeItemCollapsibleState.None);

    if (modObject instanceof Object) {
      this._modObject = modObject === undefined ? undefined : modObject;
    } else {
      this.label = modObject;
    }

    this.isDirectory = isDirectory;
    this.command = isDirectory
      ? void 0
      : {
          command: 'gomod.openResource',
          arguments: [resource],
          title: 'Open Resource',
        };
  }

  /**
   * Hide the hostname and version number of the root folder
   */
  public hideHost(enable: boolean) {
    if (!this._modObject || this._modObject.SDK) {
      return;
    }
    ``;
    this.label = enable
      ? this._modObject!.Path.substring(this._modObject!.Path.indexOf('/') + 1)
      : `${this._modObject!.Path} ${this._modObject!.Version}`;
  }
}

export class ModTree implements TreeDataProvider<ModItem>, TextDocumentContentProvider, DefinitionProvider {
  private _hideHost = true;
  private _rootData: ModItem[] = [];
  private _treeView: TreeView<ModItem> | undefined; // not use outside
  private _eventEmitter = new EventEmitter<ModItem | undefined | void>();
  private _loadingBar = window.createStatusBarItem(StatusBarAlignment.Left);
  private _goSDK: ModItem | undefined;
  private _context;
  private _revealTrigger = false;
  private _revealEnable = true;

  constructor(context: ExtensionContext) {
    this._context = context;

    // try to load reveal-sn and reveal-re from setting.json
    let re: boolean | undefined = workspace.getConfiguration('gomod').get('revealEnable');
    if (re !== undefined) {
      this._revealEnable = re;
    }

    this._loadingBar.text = '$(loading~spin) Loading Go Mod Explorer';
    this._loadingBar.show();

    this.setGoSDK(queryGoSDK());

    this._treeView = window.createTreeView('gomod', {
      treeDataProvider: this,
    });

    this._loadingBar.hide();
  }

  public get onDidChangeTreeData(): Event<ModItem | undefined | void> {
    return this._eventEmitter.event;
  }

  private updateView() {
    this._eventEmitter.fire();
  }

  public setGoSDK(src: ModObject | null) {
    // we should clear the empty lib at first
    this._goSDK = undefined;
    if (src !== null && src.Dir !== undefined) {
      this._goSDK = new ModItem(src, parseChildURI(Uri.parse(src.Dir), 'src'), true);
      let lbw = `GO SDK ${this._goSDK._modObject?.GoVersion}`;
      this._goSDK.label = { label: lbw, highlights: [[0, lbw.length]] };
      this._goSDK.iconPath = Uri.joinPath(this._context.extensionUri, 'resources', 'go.svg');
    }
  }

  public update() {
    this._loadingBar.show();
    workspace.workspaceFolders?.forEach((wf, index) => {
      exec('cd ' + wf.uri.fsPath + ' && go list -mod=readonly -m -json all', (error, stdout, stderr) => {
        if (error === null && stderr === '') {
          stdout = stdout.replace(new RegExp('}(,+)?', 'g'), '},');
          stdout = stdout.replace('{', '[{');
          stdout = stdout.trimRight();
          stdout = stdout.substring(0, stdout.length - 1) + ']';
          let dat = JSON.parse(stdout);

          // create root's dirs
          this._rootData = [];
          if (this._goSDK !== undefined) {
            this._rootData?.push(this._goSDK);
          }
          dat.forEach((res: ModObject, index: number) => {
            if (index !== 0 && res.Dir !== undefined) {
              let item = new ModItem(res, Uri.parse(res.Dir), res.Dir !== undefined);
              item.iconPath = Uri.joinPath(
                this._context.extensionUri,
                'resources',
                res.Indirect ? 'module_indirect.svg' : 'module_direct.svg'
              );
              item.hideHost(this._hideHost);
              this._rootData?.push(item);
            }
          });
          this.updateView();
          this._loadingBar.hide();
        }
      });
    });
  }

  public focus() {
    if (this._treeView !== undefined && this._rootData.length > 0) {
      this._treeView.reveal(this._rootData[0], {
        select: true,
        focus: true,
        expand: false,
      });
    }
  }

  public hideHost() {
    this._hideHost = !this._hideHost;
    this._rootData.forEach((res) => {
      res.hideHost(this._hideHost);
    });
    this.updateView();
  }

  public watch() {
    if (this._revealEnable) {
      // golang languages selector
      let goSelector: DocumentSelector = { scheme: 'file', language: 'go' };
      // provide function
      languages.registerDefinitionProvider(goSelector, this);
      window.onDidChangeActiveTextEditor((e) => {
        if (e !== undefined && this._revealTrigger) {
          this._revealTrigger = false;
          console.log('reveal to:', e.document.fileName);

          this._treeView?.reveal(new ModItem(path.basename(e.document.uri.fsPath), e.document.uri, false), {
            select: true,
            focus: true,
            expand: true,
          });
        }
      });
    }

    // watch the workspaces
    workspace.workspaceFolders?.forEach((e) => {
      watch(e.uri.fsPath + '/go.mod', () => {
        this.update();
      });
    });

    // watch whether goroot has changed by the setting file
    workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('go')) {
        let gsdk = queryGoSDK();
        this.setGoSDK(gsdk);
        this.update();
      }
    });
  }

  public getRoot(): ModItem[] | undefined {
    return this._rootData;
  }

  public getTreeItem(element: ModItem): TreeItem | Thenable<TreeItem> {
    return element;
  }

  public getParent(element: ModItem): ModItem | null {
    let parentName = path.basename(path.dirname(element.resourceUri?.path));
    let parentPathString = path.resolve(element.resourceUri?.fsPath, '..');
    let parentPathURI = Uri.parse(parentPathString);

    if (parentName === '') {
      return null;
    }

    for (let index = 0; index < this._rootData.length; index++) {
      let ep1 = element.resourceUri?.path;
      let ep2 = this._rootData[index].resourceUri?.path;
      if (ep1 === ep2) {
        return null;
      }
      if (parentPathURI.path === this._rootData[index].resourceUri?.path) {
        return this._rootData[index];
      }
    }
    return new ModItem(parentName, Uri.parse(parentPathString), true);
  }

  public getChildren(element?: ModItem): ProviderResult<ModItem[]> {
    let ret: ModItem[] = [];
    if (element === undefined) {
      return this._rootData.sort(({ isDirectory: s1 = false }, { isDirectory: s2 = false }) => Number(s2) - Number(s1));
    } else {
      const result = readdirSync(resolvePath(element.resourceUri!));
      result.forEach((fileName) => {
        ret.push(
          new ModItem(
            fileName,
            parseChildURI(element.resourceUri!, fileName),
            !statSync(element.resourceUri!.path + '/' + fileName).isFile()
          )
        );
      });
      return ret.sort(({ isDirectory: s1 = false }, { isDirectory: s2 = false }) => Number(s2) - Number(s1));
    }
  }

  public provideTextDocumentContent(uri: Uri, token: CancellationToken): ProviderResult<string> {
    throw new Error('Method not implemented.3');
  }

  provideDefinition(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): ProviderResult<Definition | LocationLink[]> {
    this._revealTrigger = true;
    return null;
  }
}
