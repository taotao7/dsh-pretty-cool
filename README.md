# DSH Pretty Cool

A compact interface for DeepSeek Harness. Ordinary messages, the queue, and task status are tightened so there are fewer borders, fewer stacked layers, and the information stays within reach.

**DSH `0.2.1-rc.2` · standalone Cordis bundle · uninstall restores the original UI**

[中文](#中文)

## Preview

What the interface actually shows: a light goal bar, a transparent context readout, and status tucked along the top edge of the composer. Screenshots are from a real session.

**Dark**

![Dark UI](docs/screenshots/dark.png)

**Light**

![Light UI](docs/screenshots/light.png)

## Interface

- **Sessions**: ordinary messages have no card border. Copy is supported, reasoning expands on a thin rule, and the process summary collapses to one line.
- **Composer**: model search, one-click cycling of thinking levels, the working directory, context usage, and native statistics sit around the input. The context ring is set into the top edge on a transparent background.
- **Tasks**: Goal, to-dos, sub-agents, background tasks, and Creator mode sit above the composer. The queue is a thin-divider list; edit, delete, and send stay native actions.
- **Running indicator**: Deep diving keeps the native copy and timer, with steady text and a rotating three-dot mark. It stays still when the system requests reduced motion.
- **Appearance**: Light, Dark, System, font size, and a global corner radius (0–16, default 6). Buttons, inputs, menus, and panels scale together.
- **Native behavior**: the editor, streaming, attachments, permissions, commands, sessions, workspace, and task actions stay native. Removing the whole bundle restores the original interface.

## Install

Install from npm with the official DSH profile plugin command:

```sh
dsh plugin --profile web add dsh-pretty-cool
```

For another profile, replace `web` with its name. If the old package `@local/dsh-linear-ui` is installed, remove it before adding the new name:

```sh
dsh plugin --profile web remove @local/dsh-linear-ui
dsh plugin --profile web add dsh-pretty-cool
```

Restore the native interface:

```sh
dsh plugin --profile web remove dsh-pretty-cool
```

Disabling or removing the whole bundle restores the native interface and does not modify official install files. Sidebar entries registered by other plugins still appear above the session list.

## Development

```sh
npm ci
npm run check && npm test
npm run build && npm run verify
npm pack
```

`DSH_ROOT` may point at a local DSH install for extra checks against native interfaces. Those checks are skipped, and reported as skipped, when it is unset.

## Plugin market

After enabling “Custom plugin markets” in DSH, add this author-maintained index in Discover:

```text
https://raw.githubusercontent.com/taotao7/dsh-pretty-cool/main/market.json
```

The index is pinned to a git commit of the prebuilt code, so installation does not build it. This is a community plugin and is not an official DSH endorsement. Compatibility remains `0.2.1-rc.2`.

The composer takes its cue from [oh-my-pi](https://github.com/can1357/oh-my-pi). You may download, build, install, run, and modify it for your own use. This is not an MIT grant; see [LICENSE](LICENSE). Third-party sources and licenses are in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## 中文

给 DeepSeek Harness 的紧凑界面。普通消息、队列和任务状态都按“少边框、少叠层、信息仍在手边”仔细收过。

**适配 DSH `0.2.1-rc.2` · 独立 Cordis bundle · 支持卸载还原**

### 预览

实际界面细节：轻量目标栏、透明上下文读数，以及收在输入框上沿的状态。截图来自真实会话。

**Dark**

![Dark 界面](docs/screenshots/dark.png)

**Light**

![Light 界面](docs/screenshots/light.png)

### 界面与功能

- **会话**：普通消息无卡片边框；支持复制，推理内容用细线展开，过程摘要收成一行。
- **输入区**：模型搜索、单击循环切换思考级别、工作目录、上下文占用和原生统计集中在输入框周围。上下文圆环嵌在上沿，背景透明。
- **任务**：Goal、To-dos、子 agent、后台任务和 Creator mode 收在输入区上方。队列改成细分隔线列表，编辑、删除和发送仍使用原生操作。
- **运行提示**：Deep diving 保留原生文案和计时，使用稳定文字与三点轮流提示；系统减少动效时保持静止。
- **外观**：Light、Dark、System、字号，以及全局圆角（0–16，默认 6）。按钮、输入框、菜单和面板按比例一起变化。
- **原生能力**：编辑器、流式输出、附件、权限、命令、会话、工作区和任务操作保持原生。卸载整个 bundle 即可恢复原界面。

### 安装

使用 DSH 官方的 profile 插件命令，直接从 npm 安装：

```sh
dsh plugin --profile web add dsh-pretty-cool
```

其他 profile 把 `web` 换成对应名称。已安装旧版 `@local/dsh-linear-ui` 时，先移除再安装新包名：

```sh
dsh plugin --profile web remove @local/dsh-linear-ui
dsh plugin --profile web add dsh-pretty-cool
```

恢复原生界面：

```sh
dsh plugin --profile web remove dsh-pretty-cool
```

禁用或卸载整个 bundle 即恢复原生界面，不会修改官方安装文件。其他插件注册的侧栏入口仍会显示在会话列表上方。

### 开发

```sh
npm ci
npm run check && npm test
npm run build && npm run verify
npm pack
```

`DSH_ROOT` 可指向本地 DSH 安装目录，以额外检查原生接口；未设置时会明确跳过这些检查。

### 插件市场

在 DSH 启用「Custom plugin markets」后，可在 Discover 添加这个作者维护的索引：

```text
https://raw.githubusercontent.com/taotao7/dsh-pretty-cool/main/market.json
```

索引固定到预构建代码的 Git commit，不需要安装时构建。此为社区插件，不代表 DSH 官方认证。兼容范围仍为 `0.2.1-rc.2`。

参考 [oh-my-pi](https://github.com/can1357/oh-my-pi) 的输入体验。允许下载、构建、安装、运行和为自用修改；不是 MIT 开源授权，详见 [LICENSE](LICENSE)。第三方来源与许可见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
