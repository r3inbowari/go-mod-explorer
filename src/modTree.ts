import { queryGoSDK } from './api';
import { ModObject } from './file';
import { exec } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { join } from "path";
import { parseChildURI, resolvePath, getParentNode } from './utils';

import {
  Uri,
  Event,
  window,
  commands,
  TreeView,
  TreeItem,
  Position,
  languages,
  workspace,
  Definition,
  LocationLink,
  EventEmitter,
  TextDocument,
  MarkdownString,
  ProviderResult,
  DocumentSelector,
  ExtensionContext,
  TreeDataProvider,
  CancellationToken,
  DefinitionProvider,
  StatusBarAlignment,
  TreeItemCollapsibleState,
  TextDocumentContentProvider,
} from 'vscode';

var path = require('path');
var chokidar = require('chokidar');

/**
 * Type of the ModItem
 */
export enum ModItemType {
  /**
   * Determines an item as a directory, but the number of items inside the directory is undefined.
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Directory = -1,

  /**
   * Determines an item as a file.
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  File = 0,

  /**
   * Module > 0
   */
}

/**
 * ModItem can be a modules, a package or a file.
 *
 * @param itemType when it is a number type, it means it is a directory and the number
 * inside the directory is determined. otherwise a {@link ModItemType} type.
 */
export class ModItem extends TreeItem {
  public isDirectory: boolean = false;
  public _modObject: ModObject | undefined;

  /**
   * _isRoot indicates that the ModItem (current path) is the root directory of a module.
   * true if ModItem is the root of a module.
   */
  public _isRoot: boolean = false;

  public _visualParent: string | undefined = undefined;

  private _size: number = 0;

  constructor(
    nameOrPackage: ModObject | string | undefined,
    resource: Uri,
    itemType: ModItemType | number = ModItemType.File
  ) {
    super(resource, itemType === ModItemType.File ? TreeItemCollapsibleState.None : TreeItemCollapsibleState.Collapsed);
    this._size = itemType;

    if (nameOrPackage instanceof Object) {
      this._modObject = nameOrPackage === undefined ? undefined : nameOrPackage;
      // we infer it is a root.
      this._isRoot = true;

      // set the version of the module in TreeItem.description.
      this.description = this._modObject?.Version;

      if (!this._modObject?.Main) {
        this.contextValue = 'package';
      } else if (this._modObject.SDK) {
        this.contextValue = 'gosdk';
      }
    } else {
      this.label = nameOrPackage;
      if (itemType === ModItemType.Directory) {
        this.contextValue = 'directory';
      }
    }

    // generate hover content.
    this.createHover();

    this.isDirectory = itemType !== ModItemType.File;
    this.command = this.isDirectory
      ? void 0
      : {
          command: 'gomod.openResource',
          arguments: [resource],
          title: 'Open Resource',
        };
  }

  private createHover() {
    if (this._modObject !== undefined) {
      const markdownDocumentation = new MarkdownString();
      markdownDocumentation.supportHtml = true;
      markdownDocumentation.supportThemeIcons = true;

      if (this._modObject?.Main) {
        if (this._modObject.SDK) {
          markdownDocumentation.appendMarkdown(`$(package) \`golang/go\`  \n`);
          markdownDocumentation.appendMarkdown(`$(versions) \`${this._modObject.GoVersion}\`  \n`);
          markdownDocumentation.appendMarkdown(
            `$(symbol-event) \`${this._modObject.Platform}\` \`${this._modObject.Arch}\`  \n`
          );
          markdownDocumentation.appendMarkdown(
            `  \n$(remote-explorer-documentation) [See Document](https://go.dev/doc/)  \n`
          );
        } else {
          markdownDocumentation.appendMarkdown(
            `$(folder-library) \`${this._modObject!.Path.substring(this._modObject!.Path.indexOf('/') + 1)}\`  \n`
          );
          if (this._modObject.GoVersion !== undefined) {
            markdownDocumentation.appendMarkdown(`$(target) \`Go ${this._modObject.GoVersion}\`  \n`);
          }
          markdownDocumentation.appendMarkdown(`$(layers-active) \`${this._size} Packages\`  \n`);
        }
      } else {
        markdownDocumentation.appendMarkdown(
          `$(package) \`${this._modObject!.Path.substring(this._modObject!.Path.indexOf('/') + 1)}\`  \n`
        );

        if (this._modObject.Replace !== undefined) {
          markdownDocumentation.appendMarkdown(`$(arrow-circle-down) \`${this._modObject.Path}\`  \n`);
          markdownDocumentation.appendMarkdown(
            `$(versions) \`${this._modObject.Version}\` $(arrow-small-right) \`${
              this._modObject.Replace.Version === undefined
                ? this._modObject.Replace.Path
                : this._modObject.Replace.Version
            }\`  \n`
          );
        } else {
          markdownDocumentation.appendMarkdown(`$(versions) \`${this._modObject.Version}\`  \n`);
        }

        if (this._modObject.GoVersion !== undefined) {
          markdownDocumentation.appendMarkdown(`$(target) \`Go ${this._modObject.GoVersion}\`  \n`);
        }
        if (this._modObject.Time !== undefined) {
          markdownDocumentation.appendMarkdown(
            `$(timeline-view-icon) \`${new Date(this._modObject.Time).toLocaleString()}\`  \n`
          );
        }
        markdownDocumentation.appendMarkdown(
          `$(globe) \`${this._modObject!.Path.substring(0, this._modObject!.Path.indexOf('/'))}\`  \n`
        );
        markdownDocumentation.appendMarkdown(
          `  \n$(remote-explorer-documentation) [See Document](https://pkg.go.dev/mod/${this._modObject.Path})  \n`
        );
      }
      this.tooltip = markdownDocumentation;
    }
  }

  /**
   * Hide the hostname and version number of the root folder.
   *
   * @deprecated No longer supported because we removed this feature.
   *
   * @param enable true if we need to hide the details.
   */
  public hideHost(enable: boolean) {
    if (!this._modObject || this._modObject.SDK) {
      return;
    }

    this.label = enable
      ? this._modObject!.Path.substring(this._modObject!.Path.indexOf('/') + 1)
      : `${this._modObject!.Path} ${this._modObject!.Version}`;
  }
}

export class ModTree implements TreeDataProvider<ModItem>, TextDocumentContentProvider, DefinitionProvider {
  private _rootData: ModItem[] = [];
  private _treeView: TreeView<ModItem> | undefined; // not use outside.

  /**
   * root map
   */
  private _rootMap = new Map<string, ModItem[]>();

  /**
   * It is usually used for tree view updates.
   */
  private _eventEmitter = new EventEmitter<ModItem | undefined | void>();

  /**
   * loading bar shows that explorer is loading.
   */
  private _loadingBar = window.createStatusBarItem(StatusBarAlignment.Left);

  private _goSDK: ModItem | undefined;

  /**
   * vscode context.
   */
  private _context;

  /**
   * true if we enable the code reveal.
   */
  private _autoReveal = true;

  /**
   * true if "go to definition" is triggered, and it will be reset
   * to false when code reveal is complete.
   */
  private _revealTrigger = false;

  constructor(context: ExtensionContext) {
    this._context = context;

    // try to load autoReveal from settings.json.
    let autoReveal: boolean | undefined = workspace.getConfiguration('gomod').get('autoReveal');
    if (autoReveal !== undefined) {
      this._autoReveal = autoReveal;
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
    // we should clear the empty lib at first.
    this._goSDK = undefined;
    if (src !== null && src.Dir !== undefined) {
      this._goSDK = new ModItem(src, parseChildURI(Uri.parse(src.Dir), 'src'), ModItemType.Directory);
      let lbw = `Go SDK`;
      this._goSDK.label = { label: lbw /* ,highlights: [[0, lbw.length]] */ };
      this._goSDK.description = `${this._goSDK._modObject?.GoVersion}`;
      this._goSDK.iconPath = Uri.joinPath(this._context.extensionUri, 'resources', 'go.svg');
    }
  }

  /**
   * loading modules for a go.mod file.
   *
   * @param modPath A universal resource identifier representing a go.mod file.
   *
   * @return A Promise {@link Promise<T>} wrapper with a collection of modules under the current project.
   *
   * *Note* that the environment of go is determined by goroot.
   * *Note* that index === 0 is project itself. we call it the main module. Because other modules
   * are referenced by the main module, we will use the modulesList[0].Path as modules label.
   * *Note* that when loading a child modules list, the intersection of the child and parent
   * modules will be collapsed.
   *
   */
  public loadModules(modPath: Uri): Promise<Array<ModObject>> {
    return new Promise((resolve, reject) => {
      let modParentPath = getParentNode(modPath.fsPath);

      if (modParentPath === '') {
        reject('empty parent');
      }

      exec('go list -mod=readonly -m -json -e all', { cwd: modParentPath }, (error, stdout, stderr) => {
        if (error === null && stderr === '') {
          // Parsing stdout with modules information to a json.
          // fix: failed to parse replace line. See https://github.com/r3inbowari/go-mod-explorer/issues/10
          stdout = stdout.replace(new RegExp('}(,+)?', 'g'), '},');
          stdout = stdout.replace('{', '[{');
          stdout = stdout.trimRight();
          stdout = stdout.substring(0, stdout.length - 1) + ']';
          let rawModulesData: ModObject[] = JSON.parse(stdout);

          resolve(rawModulesData);
        } else {
          reject(error);
        }
      });
    });
  }

  public parseModules(rawModules: ModObject[]): Promise<Array<ModItem>> {
    return new Promise((resolve, reject) => {
      let modulesList: ModItem[] = [];
      let readableModulesLength = 0;
      rawModules.forEach((mod: ModObject, index: number) => {
        if (mod.Dir !== undefined) {
          readableModulesLength++;
        }
      });
      // Init modules list.
      rawModules.forEach((mod: ModObject, index: number) => {
        if (mod.Dir !== undefined) {
          let item = new ModItem(mod, Uri.parse(mod.Dir), readableModulesLength - 1);

          item.iconPath = Uri.joinPath(
            this._context.extensionUri,
            'resources',
            index !== 0 ? (mod.Indirect ? 'module_indirect.svg' : 'module_direct.svg') : 'module_group.svg'
          );

          if (item._modObject !== undefined && item._modObject.Replace !== undefined) {
            item.iconPath = Uri.joinPath(this._context.extensionUri, 'resources', 'module_replace.svg');
          }

          item.hideHost(true);
          modulesList.push(item);
        }
      });
      // Sort the modules according to (in)direct with alphabetical order.
      // And not sort the first module.
      modulesList.sort(({ _modObject: m0 }, { _modObject: m1 }) =>
        m0?.Indirect === m1?.Indirect ? 0 : m0?.Indirect ? 1 : -1
      );

      if (modulesList.length > 0) {
        modulesList[0].description = `<${modulesList[0].label}>`;
        modulesList[0].label = `Go Modules`;
        // set context value for modules root.
        modulesList[0].contextValue = 'modules';
      }
      resolve(modulesList);
    });
  }

  public update(modFile: Uri): Promise<string> {
    return new Promise((resolve, rejects) => {
      this.loadModules(modFile)
        .then((rawModulesList) => {
          this.parseModules(rawModulesList).then((modulesList: any) => {
            this._rootMap.set(modulesList[0]._modObject!.Path, modulesList);
            this.updateView();
            resolve(modulesList[0]._modObject.Path);
          });
        })
        .catch((err) => {
          console.log('catch update error: ', err);
          // TODO: invaild modules tag here.
        });
    });
  }

  public updateAll() {
    this._rootMap.clear();
    this._loadingBar.show();
    // load go sdk
    this.setGoSDK(queryGoSDK());

    workspace.findFiles('**/go.mod').then((goModFiles) => {
      goModFiles.forEach((modFile) => {
        // load other modules
        this.update(modFile);
      });
      this._loadingBar.hide();
    });
  }

  /**
   * Focus the first item in order to use keyword search directly.
   */
  public focus() {
    if (this._treeView !== undefined && (this._goSDK === null ? 0 : 1) + this._rootMap.size > 0) {
      this._treeView.reveal(this._goSDK !== undefined ? this._goSDK : this._rootData[0], {
        select: true,
        focus: true,
        expand: false,
      });
    }
  }

  /**
   * Collapse the tree.
   *
   * See https://github.com/microsoft/vscode/issues/44746
   * See Main Thread https://github.com/microsoft/vscode/issues/55879
   * See https://github.com/microsoft/vscode/issues/78970
   * See https://github.com/microsoft/vscode/issues/92176
   *
   * Comment from #44746: Setting collapsibleState property is for initial state and
   * cannot override the user state. But if you want to programatically reveal an item,
   * there is an api coming in here - #30288
   *
   * For the above issues, we found that if the {@link TreeItem.label} is not changed,
   * the tree view may be not collapsed. So we need to add an invisible token to the
   * front of the label content ('\r' is a good choice) in order to make collapse work.
   *
   * We call workbench.actions.treeView.[viewID which setting on package.json views attrs].collapseAll to collapse All items
   *
   * @update 2022/06/16
   */
  public collapse() {
    commands.executeCommand('workbench.actions.treeView.gomod.collapseAll');
  }

  // TODO: save work states
  // ref: https://github.com/flawiddsouza/favorite-folders/blob/79f643042fd65c1bad41d52d3eba946975be967a/src/extension.ts

  public watch() {
    if (this._autoReveal) {
      // golang languages selector
      let goSelector: DocumentSelector = { scheme: 'file', language: 'go' };
      // provide function
      languages.registerDefinitionProvider(goSelector, this);
      window.onDidChangeActiveTextEditor((e) => {
        if (e !== undefined && this._revealTrigger) {
          this._revealTrigger = false;
          console.log('reveal to:', e.document.fileName);

          this._treeView?.reveal(new ModItem(path.basename(e.document.uri.fsPath), e.document.uri, ModItemType.File), {
            select: true,
            focus: true,
            expand: true,
          });
        }
      });
    }

    // TODO: emit when a new folder add to workspace
    // workspace.onDidChangeWorkspaceFolders(() => {
    //   console.log('233');
    // });

    workspace.workspaceFolders?.forEach((folder) => {
      console.log('loading:', folder.uri.fsPath);

      // Initialize watcher.
      const watcher = chokidar.watch(['**/go.mod', '**/go.sum'], {
        ignored: /(^|[\/\\])\../,
        persistent: true,
        cwd: folder.uri.fsPath,
      });

      let _watchMap: Map<string, string> = new Map<string, string>();
      // Add event listeners.
      watcher
        .on('add', (path: any) => {
          console.log('add:', path);
          this._loadingBar.show();
          this.update(parseChildURI(folder.uri, path)).then((res) => {
            _watchMap.set(path, res);
          });
          this._loadingBar.hide();
        })
        .on('change', (path: any) => {
          console.log('change:', path);
          let oldModuleName = _watchMap.get(path);
          this._loadingBar.show();
          this.update(parseChildURI(folder.uri, path)).then((newModuleName) => {
            _watchMap.set(path, newModuleName);

            if (oldModuleName !== newModuleName && oldModuleName !== undefined) {
              this._rootMap.delete(oldModuleName);
              this.updateView();
            }
          });
          this._loadingBar.hide();
        })
        .on('unlink', (path: any) => {
          console.log('unlink:', path);
          this._loadingBar.show();
          let k1 = _watchMap.get(path);
          if (k1 !== undefined) {
            this._rootMap.delete(k1);
            this.updateView();
          }
          this._loadingBar.hide();
        });
    });

    // watch whether goroot has changed in the settings file by user
    workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('go')) {
        // TODO: need fix
        setTimeout(() => {
          let gsdk = queryGoSDK();
          this.setGoSDK(gsdk);
          // this.updateAll();
          this.updateView();
        }, 3000);
      }
    });
  }

  public getRoot(): ModItem[] | undefined {
    let retRoot: ModItem[] = [];
    // return this._rootData;
    if (this._goSDK) {
      retRoot.push(this._goSDK);
    }
    this._rootMap.forEach((mods: ModItem[], modulesName: string) => {
      retRoot.push(mods[0]);
    });

    return retRoot;
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

    if (element._visualParent) {
      let treeHead = this._rootMap.get(element._visualParent);
      element._visualParent = undefined;
      if (treeHead) {
        return treeHead[0];
      }
    }

    if (this._goSDK !== undefined) {
      if (parentPathURI.path === this._goSDK.resourceUri?.path) {
        return this._goSDK;
      }
    }

    for (const [modulesName, mods] of this._rootMap) {
      for (let index = 1; index < mods.length; index++) {
        if (parentPathURI.path === mods[index].resourceUri?.path) {
          mods[index]._visualParent = modulesName;
          return mods[index];
        }
      }
    }
    return new ModItem(parentName, Uri.parse(parentPathString), ModItemType.Directory);
  }

  public getChildren(element?: ModItem): ProviderResult<ModItem[]> {
    let ret: ModItem[] = [];
    if (element === undefined) {
      return this.getRoot();
    }
    if (element._modObject !== undefined && this._rootMap.has(element._modObject.Path)) {
      return this._rootMap.get(element._modObject.Path)?.slice(1);
    } else {
      const dirPath = resolvePath(element.resourceUri!);
      const result = readdirSync(dirPath);
      result.forEach((fileName) => {
        ret.push(
          new ModItem(
            fileName,
            parseChildURI(element.resourceUri!, fileName),
            statSync(join(dirPath, fileName)).isFile() ? ModItemType.File : ModItemType.Directory
          )
        );
      });
      return ret.sort(({ isDirectory: s1 = false }, { isDirectory: s2 = false }) => Number(s2) - Number(s1));
    }
  }

  public provideTextDocumentContent(uri: Uri, token: CancellationToken): ProviderResult<string> {
    throw new Error('Method not implemented: provideTextDocumentContent');
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
