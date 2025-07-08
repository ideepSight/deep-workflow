import React, { useContext, useEffect, useMemo } from 'react';
import './index.less';
import { observer } from 'mobx-react-lite';
import { Button, Divider, Empty, Input, InputNumber, Popconfirm, Space, Spin, Switch, Tooltip } from '@arco-design/web-react';
import { BlockEnum, DPBaseNode } from '../lib';
import { WorkfowContext } from './context';
import { IconClose, IconDelete, IconPlayCircle, IconRecordStop } from '@arco-design/web-react/icon';
import { useI18n } from '../i18n';

export const BaseNodePane: React.FC = observer(() => {
	const { workflowIns } = useContext(WorkfowContext);
	const activeNode = workflowIns.dpNodes.find((n) => n.active);
	const [title, setTitle] = React.useState('');
	const [errorTitle, setErrorTitle] = React.useState('');
	const { t } = useI18n();

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
	const SetComponent = baseInfo.SetComponent || (() => <Empty description={t('workflow:nodePane.noConfig')} />);

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
								setErrorTitle(t('workflow:nodePane.titleRequired'));
								setTitle(v);
								return;
							}
							if (!/^[a-zA-Z_\u4e00-\u9fa5$][a-zA-Z0-9_\u4e00-\u9fa5$]*$/.test(v)) {
								return setErrorTitle(t('workflow:nodePane.titlePattern'));
							}
							setErrorTitle('');
							setTitle(v);
						}}
					/>
				</Space>
				<div className="btns">
					{activeNode.singleRunAble && (
						<Tooltip content={activeNode.singleRunning ? t('workflow:nodePane.running') : t('workflow:nodePane.runStep')}>
							{activeNode.singleRunning ? (
								<Button type="text" className="big-icon" icon={<Spin size={14} />} />
							) : (
								<Button type="text" className="big-icon" icon={<IconPlayCircle />} onClick={() => activeNode.runSingle()} />
							)}
						</Tooltip>
					)}
					{activeNode.singleRunning && (
						<Tooltip content={t('workflow:nodePane.stopStep')}>
							<Button type="text" className="big-icon" icon={<IconRecordStop />} onClick={() => activeNode.stop()} />
						</Tooltip>
					)}
					{activeNode.nodeConfig.type !== BlockEnum.Start && (
						<Popconfirm title={t('workflow:nodePane.confirmDelete')} onOk={() => workflowIns.delNode(activeNode)}>
							<Tooltip content={t('workflow:nodePane.delete')}>
								<Button type="text" className="big-icon" status="danger" icon={<IconDelete />} />
							</Tooltip>
						</Popconfirm>
					)}
					<Divider type="vertical" />
					<Button type="text" className="big-icon" icon={<IconClose />} onClick={() => (activeNode.active = false)} />
				</div>
			</div>
			<div className="error-title">{errorTitle}</div>
			<div className="content-wrap">
				<Input.TextArea
					className="node-desc"
					onChange={(v) => (activeNode.data.desc = v)}
					placeholder={t('workflow:nodePane.inputDesc')}
					value={activeNode.data.desc || baseInfo.desc}
					maxLength={100}
					rows={1}
				/>
				<Divider />
				<SetComponent node={activeNode} />
				{(activeNode.nodeConfig.group !== 'sys' || activeNode.nodeConfig.type === BlockEnum.Code) && (
					<>
						<Divider />
						<b className="handle-name">{t('workflow:nodePane.retryOnFail')}</b>
						<Switch
							className="switch"
							size="small"
							checked={activeNode.data.failRetryEnable}
							onChange={(v) => (activeNode.data.failRetryEnable = v)}
						/>
					</>
				)}
				{activeNode.data.failRetryEnable && (
					<>
						<div className="handle-item">
							<span className="name">{t('workflow:nodePane.maxRetry')}</span>
							<InputNumber
								className="num-input"
								min={1}
								value={activeNode.data.maxRetryTimes}
								onChange={(v) => (activeNode.data.maxRetryTimes = v)}
								suffix={t('workflow:nodePane.times')}
							/>
						</div>
						<div className="handle-item">
							<span className="name">{t('workflow:nodePane.retryInterval')}</span>
							<InputNumber
								className="num-input"
								min={0.1}
								step={1}
								value={activeNode.data.retryInterval}
								onChange={(v) => (activeNode.data.retryInterval = v)}
								suffix={t('workflow:nodePane.seconds')}
							/>
						</div>
					</>
				)}
			</div>
		</div>
	);
});
