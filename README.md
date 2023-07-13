# Go Mod Explorer

A vscode extension of Go Module Explorer. Link to [GitHub](https://github.com/r3inbowari/go-mod-explorer) |
[VS Code Market](https://marketplace.visualstudio.com/items?itemName=r3inbowari.gomodexplorer) |
[Open VSX](https://open-vsx.org/extension/r3inbowari/gomodexplorer)

## it looks like

![image](https://user-images.githubusercontent.com/30739857/174079982-dfce53c1-2b17-4e8e-b88c-248c461b1699.png)

## Symbols

|                                                       Icon                                                       |      Description      |
|:----------------------------------------------------------------------------------------------------------------:|:---------------------:|
|     <img src="https://raw.githubusercontent.com/r3inbowari/go-mod-explorer/main/resources/module_group.svg">     |     Module Group      | 
| <img src="https://raw.githubusercontent.com/r3inbowari/go-mod-explorer/main/resources/module_group_invaild.svg"> | Invalid Package Group | 
|    <img src="https://raw.githubusercontent.com/r3inbowari/go-mod-explorer/main/resources/module_direct.svg">     |     Direct Module     | 
|   <img src="https://raw.githubusercontent.com/r3inbowari/go-mod-explorer/main/resources/module_indirect.svg">    |    Indirect Module    | 
|    <img src="https://raw.githubusercontent.com/r3inbowari/go-mod-explorer/main/resources/module_replace.svg">    |    Replaced Module    |
|     <img src="https://raw.githubusercontent.com/r3inbowari/go-mod-explorer/main/resources/module_work.svg">      |      Work Module      | 

## Shortcuts

|                  Description                   |     Keybinding      |
| :--------------------------------------------: | :-----------------: |
| Focus the Gomod Explorer.(package name search) | Ctrl(⌘) + Shift + ' |
|      Blur and back to the previous focus.      | Ctrl(⌘) + Shift + ' |

## Settings

|       Name       |  Type   |  Default  |          Description           |
| :--------------: | :-----: | :-------: | :----------------------------: |
|    go.goroot     | String  | undefined | Custom installation directory. |
| gomod.autoReveal | Boolean |   true    |      Enable auto reveal.       |

## Q&A

---

    Q: Why is there nothing in GoMod Explorer?
    A: Make sure you have installed the Go Binary, and set the system environment or "go.goroot".
    A: Note that go.goroot has higher priority than system environment in order to be consistent with the official extension.

    Q: Why GoMod Explorer not showing in VSCode?
    A: This extension depends on the official extension, please install the "vscode-go" at first.
    A: "gopls" is also needed, You can download it by "vscode-go". For more details, please refer to the tutorial of "vscode-go".
---

    Q: How to navigate(reveal) to the external code?
    A: Make sure you have installed the official extension "vscode-go".
    A: Make sure "gomod.autoReveal" is true.
---

    Q: Why sometimes reveal doesn't work?
    A: Limited by the VSCode API, at most three levels of recursion are allowed when revealing.

---

## Credits

- [golang/vscode-go](https://github.com/golang/vscode-go)
- [jetbrains/goland](https://www.jetbrains.com/go/)

## License

This software is released under the [MIT](https://github.com/r3inbowari/go-mod-explorer/blob/main/LICENSE) license.

## Contributing

See the [Quickstart Guide](https://github.com/r3inbowari/go-mod-explorer/blob/main/vsc-extension-quickstart.md) for more information.  
If you have problems, you can ask or find on [Issue Tracker](https://github.com/r3inbowari/go-mod-explorer/issues).  
I appreciate if you could report an issue or pr. (๑•̀ㅂ•́)و✧
**Enjoy!**
