# DSH Pretty Cool

给 DeepSeek Harness 的紧凑界面。普通消息、队列和任务状态都按“少边框、少叠层、信息仍在手边”仔细收过。

**适配 DSH `0.2.1-rc.2` · 独立 Cordis bundle · 支持卸载还原**

## 预览

实际界面细节：轻量目标栏、透明上下文读数，以及收在输入框上沿的状态。截图来自真实会话。

**Dark**

![Dark 界面](docs/screenshots/dark.png)

**Light**

![Light 界面](docs/screenshots/light.png)

## 界面与功能

- **会话**：普通消息无卡片边框；支持复制，推理内容用细线展开，过程摘要收成一行。
- **输入区**：模型搜索、单击循环切换思考级别、工作目录、上下文占用和原生统计集中在输入框周围。上下文圆环嵌在上沿，背景透明。
- **任务**：Goal、To-dos、子 agent、后台任务和 Creator mode 收在输入区上方。队列改成细分隔线列表，编辑、删除和发送仍使用原生操作。
- **运行提示**：Deep diving 保留原生文案和计时，使用稳定文字与三点轮流提示；系统减少动效时保持静止。
- **外观**：Light、Dark、System、字号，以及全局圆角（0–16，默认 6）。按钮、输入框、菜单和面板按比例一起变化。
- **原生能力**：编辑器、流式输出、附件、权限、命令、会话、工作区和任务操作保持原生。卸载整个 bundle 即可恢复原界面。

## 安装

使用 DSH 官方的 profile 插件命令，直接安装钉住的预构建版本：

```sh
dsh plugin --profile web add github:taotao7/dsh-pretty-cool#PENDING_COMMIT
```

也可以从 [Releases](https://github.com/taotao7/dsh-pretty-cool/releases/latest) 下载 `local-dsh-linear-ui-1.4.11.tgz`，再安装本地包：

```sh
dsh plugin --profile web add /绝对路径/local-dsh-linear-ui-1.4.11.tgz
```

其他 profile 把 `web` 换成对应名称。升级时先移除旧版再安装：

```sh
dsh plugin --profile web remove @local/dsh-linear-ui
```

禁用或卸载整个 bundle 即恢复原生界面，不会修改官方安装文件。其他插件注册的侧栏入口仍会显示在会话列表上方。

## 开发

```sh
npm ci
npm run check && npm test
npm run build && npm run verify
npm pack
```

`DSH_ROOT` 可指向本地 DSH 安装目录，以额外检查原生接口；未设置时会明确跳过这些检查。

## 插件市场

在 DSH 启用「Custom plugin markets」后，可在 Discover 添加这个作者维护的索引：

```text
https://raw.githubusercontent.com/taotao7/dsh-pretty-cool/main/market.json
```

索引固定到预构建代码的 Git commit，不需要安装时构建。此为社区插件，不代表 DSH 官方认证。兼容范围仍为 `0.2.1-rc.2`。

参考 [oh-my-pi](https://github.com/can1357/oh-my-pi) 的输入体验。允许下载、构建、安装、运行和为自用修改；不是 MIT 开源授权，详见 [LICENSE](LICENSE)。第三方来源与许可见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
