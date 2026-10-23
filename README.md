# DSH Pretty Cool

给 DeepSeek Harness 的紧凑界面。普通消息、队列和任务状态都按“少边框、少叠层、信息仍在手边”仔细收过。

**适配 DSH `0.2.1-rc.2` · 独立 Cordis bundle · 支持卸载还原**

## 预览

实际界面细节：轻量目标栏、透明上下文读数，以及收在输入框上沿的状态。截图来自真实会话。

**Dark**

![Dark 界面](docs/screenshots/dark.png)

**Light**

![Light 界面](docs/screenshots/light.png)

## 特点

- 普通消息和队列不再逐条套卡片；目标、待办和运行状态收成细线分组。
- 上下文圆环嵌在输入框上沿，背景透明；Deep diving 用稳定文字和三点轮流提示。
- 主题旁可调全局圆角（0–16，默认 6），按钮、输入框、菜单和面板一起按比例变化。
- 模型、推理等级、目录和原生统计仍集中在输入区；编辑器、流式输出、附件、权限、命令和任务操作保持原生。

## 安装

1. 从 [Releases](https://github.com/taotao7/dsh-pretty-cool/releases/latest) 下载 `local-dsh-linear-ui-1.4.9.tgz`。
2. 在 DSH 中让助手安装下载的本地文件：

   > 请安装这个 UI bundle：`/绝对路径/local-dsh-linear-ui-1.4.9.tgz`

升级时先卸载旧版再安装；还原原生界面时，禁用或卸载整个 `@local/dsh-linear-ui` bundle。不会修改官方安装文件。

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
