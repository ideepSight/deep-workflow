import React, { useEffect } from 'react';
import { Observer } from 'mobx-react-lite';
import { Background, MiniMap, ReactFlow, SelectionMode, useEdgesState, useNodesState, Node, NodeTypes } from '@xyflow/react';
import { nodeTypes, DPWorkfowContext, WorkfowContext, edgeTypes, DPControls, DPRunLog } from '../components';
import { DPWorkflow, DPWorkflowData } from '../lib';
import { BaseNodePane } from './BaseNodePane';
import { Delete } from './varEditors/lib/getHotkeyHandler';
import { Icon } from './Icon';
import { useI18n } from '../i18n';

import './Icon/index.less';
import './index.less';

type SelfProps = { dpWorkflow: DPWorkflow; onSave: (v: DPWorkflowData) => void; autoSave?: boolean };

export const Workflow: React.FC<SelfProps> = (props) => {
	const { dpWorkflow, onSave, autoSave } = props;
	const context: DPWorkfowContext = {
		workflowIns: dpWorkflow
	};

	const { t } = useI18n();

	const [nodes, setNodes, onNodesChange] = useNodesState(dpWorkflow.dpNodes.map((node) => node.nodeData as Node));
	const [edges, setEdges, onEdgesChange] = useEdgesState(dpWorkflow.dpEdges.map((edge) => edge.data));

	useEffect(() => {
		dpWorkflow.setNodes = (nodes) => setNodes(nodes as Node[]);
		dpWorkflow.setEdges = (edges) => setEdges(edges);
		const handleSave = (data: DPWorkflowData) => {
			onSave && onSave(data);
		};
		dpWorkflow.on('save', handleSave);
		typeof autoSave === 'boolean' && (dpWorkflow.autoSave = autoSave);
		return () => {
			dpWorkflow.setNodes = undefined;
			dpWorkflow.setEdges = undefined;
			dpWorkflow.off('save', handleSave);
		};
	}, [autoSave, dpWorkflow, onSave, setEdges, setNodes]);

	return (
		<div className="workflow-wrap">
			<WorkfowContext.Provider value={context}>
				<Observer>
					{() => (
						<ReactFlow
							style={{ backgroundColor: '#F7F9FB' }}
							nodeOrigin={[0.5, 0]}
							nodes={nodes}
							edges={edges}
							nodeTypes={nodeTypes as unknown as NodeTypes}
							edgeTypes={edgeTypes}
							onNodesChange={onNodesChange}
							onEdgesChange={onEdgesChange}
							onEdgeMouseEnter={dpWorkflow?.handleEdgeEnter.bind(dpWorkflow)}
							onEdgeMouseLeave={dpWorkflow?.handleEdgeLeave.bind(dpWorkflow)}
							onConnect={dpWorkflow?.onConnect.bind(dpWorkflow)}
							deleteKeyCode={Delete.key}
							onBeforeDelete={dpWorkflow?.onBeforeDelete.bind(dpWorkflow)}
							onNodeClick={dpWorkflow?.handleNodeClick.bind(dpWorkflow)}
							onNodeDragStop={dpWorkflow?.onNodeDragStop.bind(dpWorkflow)}
							selectionKeyCode={null}
							multiSelectionKeyCode={null}
							snapToGrid={true}
							snapGrid={[1, 1]}
							attributionPosition={'hidden' as never}
							defaultViewport={{ x: 100, y: 0, zoom: 1 }}
							fitView
							fitViewOptions={{ padding: 2 }}
							panOnDrag={dpWorkflow.controlMode === 'hand'}
							selectionOnDrag={dpWorkflow.controlMode === 'pointer'}
							selectionMode={SelectionMode.Partial}
							defaultEdgeOptions={{ zIndex: 1002 }}
							minZoom={0.25}
						>
							<div className="copyright">
								<a href="https://github.com/ideepSight/deep-workflow.git" target="_blank" rel="noreferrer">
									<Icon name="logo" symbol />
									{t('workflow:copyright')}
								</a>
							</div>
							<DPControls />
							<MiniMap position="bottom-left" style={{ width: 100, height: 60, bottom: 40, background: '#f8f8f8' }} className="workflow-map" />
							<Background gap={15} color="#ccc" />
						</ReactFlow>
					)}
				</Observer>
				<BaseNodePane />
				<DPRunLog />
			</WorkfowContext.Provider>
		</div>
	);
};
