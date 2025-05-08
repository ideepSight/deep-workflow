import { Button, Divider, Dropdown, Menu, Popover, Space, Tooltip } from '@arco-design/web-react';
import { IconApps, IconPlusCircleFill, IconRedo, IconUndo, IconZoomIn, IconZoomOut } from '@arco-design/web-react/icon';
import { useReactFlow, useViewport } from '@xyflow/react';
import React, { useCallback, useContext, useEffect } from 'react';
import { WorkfowContext } from './context';
import { getLayoutByDagre } from '../utils';
import { DPNodeData } from '../lib/baseNode';
import { AddNodeMenu } from './AddNodeMenu';
import { useI18n } from '../i18n';
import { Icon } from '@deep-sight/dp-iconfont';

export const DPControls: React.FC = () => {
	const { workflowIns } = useContext(WorkfowContext);
	const { zoomIn, zoomOut, zoomTo, fitView, setViewport } = useReactFlow();
	const { zoom } = useViewport();
	const reactFlowIns = useReactFlow();
	const { t } = useI18n();

	useEffect(() => {
		workflowIns.reactFlowIns = reactFlowIns;
		setTimeout(() => {
			zoomTo(1);
		});
	}, [reactFlowIns, workflowIns, zoomTo]);

	const handleLayout = useCallback(() => {
		const nodes = workflowIns.dpNodes.map((node) => node.nodeData);
		const edges = workflowIns.dpEdges.map((edge) => edge.data);
		const layout = getLayoutByDagre(nodes, edges);
		const rankMap = {} as Record<string, DPNodeData>;
		nodes.forEach((node) => {
			if (!node.parentId && node.type === 'custom') {
				const rank = layout.node(node.id).rank;

				if (!rankMap[rank]) {
					rankMap[rank] = node;
				} else {
					if (rankMap[rank].position.y > node.position.y) rankMap[rank] = node;
				}
			}
		});
		const newNodes = nodes.map((node) => {
			if (!node.parentId && node.type === 'custom') {
				const nodeWithPosition = layout.node(node.id);

				node.position = {
					x: nodeWithPosition.x - node.width / 2 + (rankMap[nodeWithPosition.rank].width || 200) / 2,
					y: nodeWithPosition.y - node.height / 2 + rankMap[nodeWithPosition.rank].height / 2
				};
				return node;
			} else {
				return node;
			}
		});

		workflowIns.setNodes(newNodes);
		const zoom = 0.7;
		setViewport({
			x: 100,
			y: -100,
			zoom
		});
	}, [setViewport, workflowIns]);

	const handleUndo = useCallback(() => {
		workflowIns.history.undo();
	}, [workflowIns]);

	const handleRedo = useCallback(() => {
		workflowIns.history.redo();
	}, [workflowIns]);

	return (
		<Space className="control-wrap">
			<Button.Group className="control-group">
				<Button
					size="mini"
					type="text"
					className="big-icon"
					icon={<IconZoomOut />}
					onClick={(e) => {
						if (zoom <= 0.25) return;
						e.stopPropagation();
						zoomOut();
					}}
				/>

				<Dropdown
					position={'top'}
					droplist={
						<Menu style={{ width: 100 }} onClickMenuItem={(key) => zoomTo(Number(key))}>
							<Menu.Item key="2">200%</Menu.Item>
							<Menu.Item key="1">100%</Menu.Item>
							<Menu.Item key="0.5">50%</Menu.Item>
							<Menu.Item key="0.25">25%</Menu.Item>
							<Divider className="light-border" style={{ padding: 0, margin: '2px 0' }} />
							<Menu.Item key="fit" onClick={fitView}>
								{t('workflow:controls.fitView')}
							</Menu.Item>
						</Menu>
					}
				>
					<Button size="mini" type="text" style={{ width: 56 }}>
						{Number.parseFloat(`${zoom * 100}`).toFixed(0)}%
					</Button>
				</Dropdown>
				<Button
					size="mini"
					type="text"
					className="big-icon"
					icon={<IconZoomIn />}
					onClick={(e) => {
						if (zoom >= 2) return;
						e.stopPropagation();
						zoomIn();
					}}
				/>
			</Button.Group>
			<Button.Group className="control-group">
				<Tooltip content={t('workflow:controls.undo')}>
					<Button size="mini" type="text" className="big-icon" disabled={!workflowIns.history.undoEnable} onClick={handleUndo} icon={<Icon name="undo" />} />
				</Tooltip>
				<Tooltip content={t('workflow:controls.redo')}>
					<Button size="mini" type="text" className="big-icon" disabled={!workflowIns.history.redoEnable} onClick={handleRedo} icon={<Icon name="redo" />} />
				</Tooltip>
			</Button.Group>
			<Button.Group className="control-group">
				<Tooltip content={t('workflow:controls.layout')}>
					<Button size="mini" type="text" className="big-icon" onClick={handleLayout} icon={<IconApps />} />
				</Tooltip>
				<Tooltip content={t('workflow:controls.pointer')}>
					<Button
						size="mini"
						type="text"
						style={{ color: workflowIns.controlMode === 'pointer' ? 'rgb(var(--primary-6))' : 'unset' }}
						className="big-icon"
						onClick={() => (workflowIns.controlMode = 'pointer')}
						icon={<Icon name="xuanqu" />}
					/>
				</Tooltip>
				<Tooltip content={t('workflow:controls.hand')}>
					<Button
						size="mini"
						type="text"
						style={{ color: workflowIns.controlMode === 'hand' ? 'rgb(var(--primary-6))' : 'unset' }}
						className="big-icon"
						onClick={() => (workflowIns.controlMode = 'hand')}
						icon={<Icon name="penhuifenli" />}
					/>
				</Tooltip>
			</Button.Group>
			<Button.Group className="control-group">
				<Popover
					position="top"
					className="add-node-popover"
					getPopupContainer={() => document.querySelector('.workflow-wrap')}
					content={<AddNodeMenu />}
				>
					<Button size="mini" type="text" className="big-icon" icon={<IconPlusCircleFill />} />
				</Popover>
			</Button.Group>
		</Space>
	);
};
