# Go Mod Explorer README

Displays the External Library for the current go project in the Explorer.  
在文件浏览器中显示当前 Go 项目的外部依赖库

Github: https://github.com/r3inbowari/go-mod-explorer  
Vscode Market: https://marketplace.visualstudio.com/items?itemName=r3inbowari.gomodexplorer

## it looks like:

![img](https://user-images.githubusercontent.com/30739857/168066123-9eb7fdc4-ec35-492b-8bee-9e1f270dc5dc.png)

## Keyboard Shortcuts 快捷键:

|                              Description                              |               Keybinding               |
| :-------------------------------------------------------------------: | :------------------------------------: |
| Focus the Gomod Explorer. And you can search using keyboard directly. | `Ctrl+Shift+'` or `CMD+Shift+'` on Mac |
|                Blur and return to the previous focus.                 | `Ctrl+Shift+'` or `CMD+Shift+'` on Mac |

## Config Settings 配置项

|    Name     |   Type   |                      Description                       |
| :---------: | :------: | :----------------------------------------------------: |
| `go.goroot` | `String` | 自定义 Go 安装目录 <br> Custom Installation Directory. |

### Q&A 常见问题:

---

    Q: Why is there nothing in explorer?
    Q: 为什么浏览器中没有任何东西？

    A: Make sure you have installed the go binary, and set the system environment or `go.goroot`.
    A: 请确认已经安装 `Go`，并正确设置系统环境变量或 `go.goroot`。

    A: Notice that go.goroot has higher priority than system environment in order to be consistent with the official extension.
    A: 需要注意的是，为了与官方插件保持一致， `go.goroot` 的优先级高于系统环境变量.

---

    Q: How to navigate to the dependent code?
    Q: 如何导航到依赖代码？

    A: Make sure you have installed the official extension `vscode-go`.
    A: 请确保你已经安装官方扩展 vscode-go。

    A: `Reveal in Explorer View` is currently not supported.
    A: 当前不支持 `Reveal in Explorer View` 功能。

---

I'm appreciate if you can report an issues or pr. (๑•̀ㅂ•́)و✧
**Enjoy!**
