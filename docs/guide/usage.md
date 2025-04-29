# 使用方式

## 基本用法

1. 创建 DPWorkflow 实例，传入流程数据（可为空或本地存储/后端获取）。
2. 使用 <Workflow /> 组件渲染流程图。
3. 通过 workflow.save() 保存流程，workflow.run() 运行流程。

```typescript
const workflow = new DPWorkflow(JSON.parse(localStorage.getItem('wf') || '{}'));
<Workflow dpWorkflow={workflow} onSave={...} />
```

## 属性说明

- `dpWorkflow`：DPWorkflow 实例，必填。
- `onSave`：保存回调，参数为流程数据。
- `autoSave`：是否自动保存。
- `autoSaveInterval`：自动保存间隔（ms）。

## 运行与调试

- 支持单节点运行、失败重试。
- 运行日志实时输出。
- 错误自动聚焦到对应节点。 