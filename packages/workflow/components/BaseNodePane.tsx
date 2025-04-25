import React, { useContext, useEffect, useMemo } from 'react';
import './index.less';
import { observer } from 'mobx-react-lite';
import { Divider, Empty, Input, Space } from '@arco-design/web-react';
import { DPBaseNode } from '../lib';
import { WorkfowContext } from './context';
import { Icon } from '../../workflow/components/Icon';

export const BaseNodePane: React.FC = observer(() => {
	const { workflowIns } = useContext(WorkfowContext);
	const activeNode = workflowIns.dpNodes.find((n) => n.active);
	const [editTitle, setEditTitle] = React.useState(false);
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
		<div className="base-node-pane">
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
							setErrorTitle('');
							if (errorTitle) return;
							activeNode.data.title = title;
						}}
						value={title}
						onChange={(v) => {
							if (v === '') {
								return setErrorTitle('标题不能为空');
							}
							if (!/^[a-zA-Z_\u4e00-\u9fa5$][a-zA-Z0-9_\u4e00-\u9fa5$]*$/.test(v)) {
								return setErrorTitle('需以字母、中文、_或$开头');
							}
							setErrorTitle('');
							setTitle(v);
						}}
					/>
				</Space>
				<Icon name="close" style={{ cursor: 'pointer' }} onClick={() => (activeNode.active = false)} />
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
			</div>
		</div>
	);
});
