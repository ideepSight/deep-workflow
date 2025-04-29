# 工作流 API 文档

## DPWorkflow

- `constructor(data: object)`：创建工作流实例。
- `save(): object`：保存当前流程数据。
- `run(): Promise<void>`：运行整个流程。

## Workflow 组件

- `dpWorkflow`：DPWorkflow 实例，必填。
- `onSave`：保存回调。
- `autoSave`、`autoSaveInterval`：自动保存相关。

## DPBaseNode

- `runSelf(): Promise<void>`：节点运行主逻辑，需自定义节点实现。
- `static registerType(config)`：注册自定义节点类型。

## 事件与扩展

- 支持 onSave、onRun、onError 等事件回调。
- 支持自定义节点、配置组件、显示组件。 