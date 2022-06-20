# Go Mod Explorer README

Displays the external libraries for the current go project in the Explorer.  

Github: https://github.com/r3inbowari/go-mod-explorer  
VSCode Market: https://marketplace.visualstudio.com/items?itemName=r3inbowari.gomodexplorer

## it looks like:

![image](https://user-images.githubusercontent.com/30739857/174079982-dfce53c1-2b17-4e8e-b88c-248c461b1699.png)

## Shortcuts:  

|                          Description                       |       Keybinding       |
| :--------------------------------------------------------: | :--------------------: |
|       Focus the Gomod Explorer.(package name search)       | `Ctrl(⌘) + Shift + '` |
|             Blur and back to the previous focus.           | `Ctrl(⌘) + Shift + '` |

## Settings:  

|         Name         |   Type    |  Default  |            Description           |
| :------------------: | :-------: | :-------: | :------------------------------: |
|     `go.goroot`      | `String`  | undefined | Custom installation directory.   |
| `gomod.revealEnable` | `Boolean` |   true    | Enable auto reveal.              |

## Q&A:  

---

    Q: Why is there nothing in GoMod Explorer?
    A: Make sure you have installed the go binary, and set the system environment or "go.goroot".
    A: Note that go.goroot has higher priority than system environment in order to be consistent with the official extension.

    Q: Why GoMod Explorer not showing in VSCode?
    A: This extension depends on the official extension, please install the "vscode-go" at first.

---

    Q: How to navigate(reveal) to the external code?
    A: Make sure you have installed the official extension "vscode-go".
    A: Make sure "gomod.revealEnable" is true.

---

    Q: Why sometimes reveal doesn't work?
    A: Limited by the VSCode API, at most three levels of recursion are allowed when revealing.

---

I'm appreciate if you could report an issue or pr. (๑•̀ㅂ•́)و✧
**Enjoy!**
