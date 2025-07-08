import React from 'react';
import { Card, Button } from '@arco-design/web-react';
import { createRoot } from 'react-dom/client';
import { DPWorkflow, Workflow } from '../packages/workflow';

import '@arco-themes/react-deep/index.less';
import '@xyflow/react/dist/style.css';
import '@deep-sight/dp-iconfont/dist/init.es.js';
import '@deep-sight/dp-iconfont/dist/Icon.less';

const App: React.FC = () => {
	const workflow = new DPWorkflow(JSON.parse(localStorage.getItem('wf') || '{}'));

	return (
		<Card bordered={false} bodyStyle={{ height: 'calc(100vh - 50px)', width: '100%', padding: '0 0 50px 0' }}>
			<Button onClick={() => workflow.save()}>Save</Button>
			<Button onClick={() => workflow.run()}>Run</Button>
			<Workflow dpWorkflow={workflow} onSave={(v) => localStorage.setItem('wf', JSON.stringify(v))} />
		</Card>
	);
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
