import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { Background, Handle, NodeResizeControl, Position, ResizeParams, useViewport } from '@xyflow/react';
import { AddNodeMenu, BlockEnum, DPVar, DPVarType, InputVar, NodeComponentProps, SelectVar } from '../../workflow';
import { LoopNode } from '.';
import { Button, Divider, Empty, InputNumber, Popover, Radio, Space, Tag } from '@arco-design/web-react';
import './index.less';
import { IconDelete, IconPlus, IconPlusCircleFill } from '@arco-design/web-react/icon';
import { Icon } from '../../workflow/components/Icon';
export const LoopIcon = () => {
	return <Icon name="duoxunhuan" />;
};

export const Loop: React.FC<NodeComponentProps<LoopNode>> = observer(({ node }) => {
	const { zoom } = useViewport();

	useEffect(() => {
		if (!node.childNodes.find((n) => n.nodeConfig.type === BlockEnum.LoopStart)) {
			node.owner.addNode({
				position: { x: 50, y: 80 },
				width: 44,
				height: 44,
				data: { dpNodeType: BlockEnum.LoopStart, title: 'start' },
				draggable: false,
				selectable: false,
				parentId: node.id,
				extent: 'parent'
			});
		}
	}, []);

	const handleResize = (e, params: ResizeParams) => {
		node.nodeData.width = params.width;
		node.nodeData.height = params.height;
	};

	return (
		<>
			<div className="loop-node">
				<Handle id={`${node.id}-target`} type="target" className="base-handle" position={Position.Left} />
				<Handle id={`${node.id}-source`} type="source" className="base-handle" position={Position.Right} />

				<Popover
					className="add-node-popover"
					getPopupContainer={() => document.querySelector('.workflow-wrap')}
					content={<AddNodeMenu blackList={[BlockEnum.Loop]} parentNode={node} />}
				>
					<Button size="mini" type="outline" icon={<IconPlusCircleFill />}>
						添加节点
					</Button>
				</Popover>
			</div>
			<div className="loop-bg-wrap">
				<Background id={`iteration-background-${node.id}`} className="loop-bg" color="#ccc" gap={[14 / zoom, 14 / zoom]} size={2 / zoom} />
			</div>
			<NodeResizeControl
				onResizeEnd={handleResize}
				nodeId={node.id}
				position="bottom-right"
				minWidth={400}
				minHeight={200}
				maxWidth={2000}
				className="loop-resize-icon"
			/>
		</>
	);
});

export const LoopSet: React.FC<NodeComponentProps<LoopNode>> = observer(({ node }) => {
	const enableVars = node.enableVars.reverse();

	const handleChangeInput = (varItem: DPVar | null) => {
		node.loopVar = varItem;
	};

	return (
		<div className="custom-node-set-wrap loop-node-set">
			<Space direction="vertical" style={{ width: '100%' }}>
				<div style={{ gap: 6, display: 'flex', alignItems: 'center', marginBottom: 12 }}>
					<Radio.Group
						size="small"
						options={[
							{ label: '按固定次数', value: false },
							{ label: '按数组变量', value: true }
						]}
						type="button"
						value={node.isByVar}
						onChange={(checked) => (node.isByVar = checked)}
					/>
				</div>
				<div style={{ justifyContent: 'space-between', width: '100%', display: 'flex', alignItems: 'center', gap: 12 }}>
					{node.isByVar ? (
						<>
							<b>循环变量</b>
							<SelectVar
								style={{ flex: 1 }}
								filterType={[DPVarType.ArrayNumber, DPVarType.ArrayString, DPVarType.ArrayObject, , DPVarType.Number]}
								empty="前面节点没有数组"
								enableVars={enableVars}
								value={node.loopVar}
								onChange={handleChangeInput}
							/>
							<Tag size="small" bordered>
								Array
							</Tag>
						</>
					) : (
						<>
							<b>次数</b>
							<InputNumber style={{ flex: 1 }} value={node.loopCount} onChange={(val) => (node.loopCount = val)} max={100} min={1} />
						</>
					)}
				</div>
				<br />
				<Divider className="light-border" />
				<div>
					<b>输出</b>
					<div className="out-var-list">
						{node.outputs.map((outVar, index) => {
							return (
								<div key={outVar.key} className="var-item-wrap">
									<InputVar
										enableVars={node.childEnableVars}
										value={{ key: outVar.key, type: outVar.type }}
										onChange={(v) => {
											outVar.key = v.key;
											outVar.type = v.type;
										}}
									/>
									<Button
										type="secondary"
										className="del-btn"
										size="mini"
										status="danger"
										shape="circle"
										icon={<IconDelete />}
										onClick={() => node.removeOutput(index)}
									/>
								</div>
							);
						})}
						{node.outputs.length === 0 ? (
							<Empty
								description={
									<Button onClick={() => node.addOutput()} icon={<IconPlus className="btn-gray-icon" />}>
										添加变量
									</Button>
								}
							/>
						) : (
							<Button style={{ marginTop: 10 }} onClick={() => node.addOutput()} icon={<IconPlus className="btn-gray-icon" />}>
								添加变量
							</Button>
						)}
					</div>
				</div>
			</Space>
		</div>
	);
});
