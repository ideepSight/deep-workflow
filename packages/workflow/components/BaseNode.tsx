import React, { memo, cloneElement, ReactElement, useContext, useEffect, useRef, Fragment } from 'react';
import { BlockEnum, DPBaseNode, DPNodeInnerData } from '../lib/baseNode';
import { Button, Popconfirm, Space, Spin, Tooltip } from '@arco-design/web-react';
import { IconDelete, IconPlayCircle } from '@arco-design/web-react/icon';
import './index.less';
import { WorkfowContext } from './context';
import { observer } from 'mobx-react-lite';
import { Node } from '@xyflow/react';
import { DPWorkflow, NodeRunningStatus } from '../lib';
import classNames from 'classnames';

// export type WorkflowRetryConfig = {
// 	maxRetries: number;
// 	retryInterval: number;
// 	retryEnabled: boolean;
// };

const BaseNodeInner: React.FC<
	Node<DPNodeInnerData> & { children: ReactElement; node: DPBaseNode<DPNodeInnerData>; nodeRef: React.RefObject<HTMLDivElement>; workflowIns: DPWorkflow }
> = observer((props) => {
	const { id, data, children, node, workflowIns, nodeRef } = props;
	const baseInfo = DPBaseNode.types[data.dpNodeType];

	return (
		<div
			ref={nodeRef}
			className={classNames(
				'base-node-wrap',
				baseInfo.type,
				{ active: workflowIns.dpNodes.find((node) => node.id === id)?.active },
				{ [node.runningStatus]: true }
			)}
		>
			<div className="node-toolbar">
				{baseInfo.type !== BlockEnum.Start && baseInfo.type !== BlockEnum.End && baseInfo.group !== 'hide' && (
					<>
						{baseInfo.group !== 'sys' && (
							<Tooltip content="运行此步骤">
								<Button type="secondary" shape="circle" size="mini" icon={<IconPlayCircle />} />
							</Tooltip>
						)}
						<Popconfirm blurToHide title="确定删除此节点吗？" onOk={() => workflowIns.delNode(id)}>
							<Button type="secondary" shape="circle" size="mini" icon={<IconDelete />} />
						</Popconfirm>
					</>
				)}
			</div>
			<div className="base-node-bg">
				<div className="base-node-inner">
					<Space className="node-name">
						<div className="node-icon-wrap" style={{ background: baseInfo.iconColor }}>
							{node.runningStatus === NodeRunningStatus.Running ? <Spin size={14} loading /> : baseInfo.icon({})}
						</div>
						{baseInfo.group !== 'hide' && <b>{node.title}</b>}
					</Space>
					{children ? cloneElement(children, { node }) : null}
				</div>
			</div>
		</div>
	);
});

const BaseNode = (props: Node<DPNodeInnerData>) => {
	const { workflowIns } = useContext(WorkfowContext);
	const nodeData = props.data;
	const NodeComponent = DPBaseNode.types[nodeData.dpNodeType].NodeComponent;
	const node = workflowIns.dpNodes.find((n) => n.id === props.id);
	const nodeRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const height = nodeRef?.current?.clientHeight;
		const width = nodeRef?.current?.clientWidth;

		Object.assign(node.nodeData, { width, height, parentId: props.parentId });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.height, props.width, props.position]);

	if (!node) {
		return null;
	}

	if (!NodeComponent) {
		console.error(`Node type ${nodeData.dpNodeType} not registered`);
		return null;
	}

	return (
		<Fragment key={`base-node-wrap-${props.id}`}>
			<BaseNodeInner nodeRef={nodeRef} {...props} node={node} workflowIns={workflowIns}>
				<NodeComponent node={null} />
			</BaseNodeInner>
		</Fragment>
	);
};

export const nodeTypes = {
	custom: BaseNode
};

export default memo(BaseNode);
