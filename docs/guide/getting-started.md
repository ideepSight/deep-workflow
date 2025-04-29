# 快速开始

## 安装

```bash
npm install @deep-sight/workflow
```

## 引入

```typescript
import { DPWorkflow, Workflow } from '@deep-sight/workflow';
import '@deep-sight/workflow/dist/style.css';
import '@arco-themes/react-deep/index.less';
import '@xyflow/react/dist/style.css';
```

## 最小用例

```typescript
import React from 'react';
import { createRoot } from 'react-dom/client';
import { DPWorkflow, Workflow } from '@deep-sight/workflow';

const App = () => {
  const workflow = new DPWorkflow({});
  return <Workflow dpWorkflow={workflow} />;
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
``` 