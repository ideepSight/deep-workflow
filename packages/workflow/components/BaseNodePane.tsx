import React, { useContext, useEffect, useMemo } from 'react';
import './index.less';
import { observer } from 'mobx-react-lite';
import { Button, Divider, Empty, Input, InputNumber, Popconfirm, Space, Spin, Switch, Tooltip } from '@arco-design/web-react';
import { DPBaseNode } from '../lib';
import { WorkfowContext } from './context';
import { Icon } from '../../workflow/components/Icon';
import { IconClose, IconDelete, IconPlayCircle, IconRecordStop } from '@arco-design/web-react/icon';

export const BaseNodePane: React.FC = observer(() => {
	const { workflowIns } = useContext(WorkfowContext);
	const activeNode = workflowIns.dpNodes.find((n) => n.active);
	const [title, setTitle] = React.useState('');
	const [errorTitle, setErrorTitle] = React.useState('');

	useEffect(() => {
		if (activeNode) {
			setTitle(activeNode.data.title);
		}
	}, [activeNode]);

	const baseInfo = useMemo(() => {
		// 仅在 activeNode 发生变化时重新计算
		if (!activeNode) return null;
		return DPBaseNode.types[activeNode.nodeData.data.dpNodeType];
	}, [activeNode]);

	if (!baseInfo) {
		return null;
	}
	const SetComponent = baseInfo.SetComponent || (() => <Empty description="无需配置" />);

	return (
		<div className="base-node-pane" key={activeNode?.id}>
			<div className="top">
				<Space className="node-name">
					<div className="node-icon-wrap" style={{ background: baseInfo.iconColor }}>
						{baseInfo.icon && baseInfo.icon({})}
					</div>
					<Input
						className="title-edite-input"
						maxLength={20}
						status={errorTitle ? 'error' : null}
						onBlur={() => {
							if (title === '') {
								return;
							}
							setErrorTitle('');
							if (errorTitle) return;
							activeNode.data.title = title;
						}}
						value={title}
						onChange={(v) => {
							if (v === '') {
								setErrorTitle('标题不能为空');
								setTitle(v);
								return;
							}
							if (!/^[a-zA-Z_\u4e00-\u9fa5$][a-zA-Z0-9_\u4e00-\u9fa5$]*$/.test(v)) {
								return setErrorTitle('需以字母、中文、_或$开头');
							}
							setErrorTitle('');
							setTitle(v);
						}}
					/>
				</Space>
				<div className="btns">
					{activeNode.singleRunAble && (
						<Tooltip content={activeNode.singleRunning ? '运行中' : '运行此步骤'}>
							{activeNode.singleRunning ? (
								<Button type="text" className="big-icon" icon={<Spin size={14} />} />
							) : (
								<Button type="text" className="big-icon" icon={<IconPlayCircle />} onClick={() => activeNode.runSingle()} />
							)}
						</Tooltip>
					)}
					{activeNode.singleRunning && (
						<Tooltip content="停止此步骤">
							<Button type="text" className="big-icon" icon={<IconRecordStop />} onClick={() => activeNode.stop()} />
						</Tooltip>
					)}
					<Popconfirm title="确定删除此节点吗？" onOk={() => workflowIns.delNode(activeNode)}>
						<Tooltip content="删除">
							<Button type="text" className="big-icon" status="danger" icon={<IconDelete />} />
						</Tooltip>
					</Popconfirm>
					<Divider type="vertical" />
					<Button type="text" className="big-icon" icon={<IconClose />} onClick={() => (activeNode.active = false)} />
				</div>
			</div>
			<div className="error-title">{errorTitle}</div>
			<div className="content-wrap">
				<Input.TextArea
					className="node-desc"
					onChange={(v) => (activeNode.data.desc = v)}
					placeholder="输入描述"
					value={activeNode.data.desc || baseInfo.desc}
					maxLength={100}
					rows={1}
				/>
				<Divider />
				<SetComponent node={activeNode} />
				<Divider />
				<b className="handle-name">失败时重试</b>
				<Switch className="switch" size="small" checked={activeNode.data.failRetryEnable} onChange={(v) => (activeNode.data.failRetryEnable = v)} />
				{activeNode.data.failRetryEnable && (
					<>
						<div className="handle-item">
							<span className="name">最大重试次数</span>
							<InputNumber
								className="num-input"
								min={1}
								value={activeNode.data.maxRetryTimes}
								onChange={(v) => (activeNode.data.maxRetryTimes = v)}
								suffix={`次`}
							/>
						</div>
						<div className="handle-item">
							<span className="name">重试间隔</span>
							<InputNumber
								className="num-input"
								min={0.1}
								step={1}
								value={activeNode.data.retryInterval}
								onChange={(v) => (activeNode.data.retryInterval = v)}
								suffix={`秒`}
							/>
						</div>
					</>
				)}
			</div>
		</div>
	);
});
