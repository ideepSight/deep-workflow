import React, { memo, cloneElement, ReactElement, useContext, useEffect, useRef, Fragment } from 'react';
import { BlockEnum, DPBaseNode, DPNodeInnerData } from '../lib/baseNode';
import { Button, Popconfirm, Space, Spin, Tooltip } from '@arco-design/web-react';
import { IconDelete, IconExclamationCircle, IconInfo, IconPlayCircle, IconRecordStop } from '@arco-design/web-react/icon';
import './index.less';
import { WorkfowContext } from './context';
import { observer } from 'mobx-react-lite';
import { Node } from '@xyflow/react';
import { DPWorkflow, NodeRunningStatus } from '../lib';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useI18n } from '../i18n';

const BaseNodeInner: React.FC<
	Node<DPNodeInnerData> & { children: ReactElement; node: DPBaseNode<DPNodeInnerData>; nodeRef: React.RefObject<HTMLDivElement>; workflowIns: DPWorkflow }
> = observer((props) => {
	const { id, data, children, node, workflowIns, nodeRef } = props;
	const baseInfo = DPBaseNode.types[data.dpNodeType];
	const { t } = useI18n();

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
						{node.singleRunAble && (
							<Tooltip content={node.singleRunning ? t('workflow:baseNode.stop') : t('workflow:baseNode.runStep')}>
								{node.singleRunning ? (
									<Button type="secondary" shape="circle" size="mini" icon={<IconRecordStop />} onClick={() => node.stop()} />
								) : (
									<Button type="secondary" shape="circle" size="mini" icon={<IconPlayCircle />} onClick={() => node.runSingle()} />
								)}
							</Tooltip>
						)}
						<Popconfirm blurToHide title={t('workflow:baseNode.confirmDelete')} onOk={() => workflowIns.delNode(id)}>
							<Button type="secondary" shape="circle" size="mini" icon={<IconDelete />} />
						</Popconfirm>
					</>
				)}
			</div>
			{node.runningStatus === NodeRunningStatus.Failed && (
				<div className="error-info">
					<Tooltip
						getPopupContainer={() => document.querySelector('.workflow-wrap')}
						content={
							<div className="error-info-p">
								{node.runlogs.map((log, i) => (
									<p key={log.time + log.msg + i} className={classNames({ [log.type]: true })}>
										<span>{dayjs(log.time).format('MM-DD HH:mm:ss')}</span> {log.msg}
									</p>
								))}
							</div>
						}
					>
						<IconExclamationCircle />
					</Tooltip>
				</div>
			)}
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
