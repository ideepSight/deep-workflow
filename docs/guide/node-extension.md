# 节点扩展开发

## 步骤一：定义节点逻辑类

新建 `customNodes/yourNode.ts`，继承 `DPBaseNode` 并实现 `runSelf` 方法：

```typescript
import { DPBaseNode } from '@deep-sight/workflow';

export class YourNode extends DPBaseNode {
  async runSelf(): Promise<void> {
    // 节点运行逻辑
  }
}
```

## 步骤二：注册节点类型

```typescript
DPBaseNode.registerType({
  type: 'customYour',
  model: YourNode,
  icon: 'icon',
  iconColor: '#09f',
  NodeComponent: YourNodeComponent, // 节点显示组件
  SetComponent: YourNodeSet,        // 配置组件（可选）
  label: '自定义节点',
  desc: '节点描述',
  group: 'custom'
});
```

## 步骤三：开发节点显示/配置组件

```typescript
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Handle, Position } from '@xyflow/react';
import { NodeComponentProps } from '@deep-sight/workflow';
import { YourNode } from './yourNode';

export const YourNodeComponent: React.FC<NodeComponentProps<YourNode>> = observer(({node}) => (
  <div>
    <Handle type="target" className="base-handle" position={Position.Left} />
    {/* 其他UI */}
  </div>
));

export const YourNodeSet: React.FC<NodeComponentProps<YourNode>> = observer(({node}) => (
  <div>
    {/* 配置表单 */}
  </div>
));
```

## 提示
- 支持热更新与自动注册。
- 可参考内置节点实现。 