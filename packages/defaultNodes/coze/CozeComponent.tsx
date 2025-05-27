import { observer } from 'mobx-react-lite';
import React from 'react';
import { Tooltip, Link, Input, Select, Image, Space } from '@arco-design/web-react';
import { Handle, Position } from '@xyflow/react';
import { Icon } from '@deep-sight/dp-iconfont';
import { CozeNode } from '.';
import { NodeComponentProps, TextEditor } from '@deep-sight/workflow';
import { IconInfoCircleFill } from '@arco-design/web-react/icon';
import { InputVar } from '../code/InputVar';

export const CozeIcon = () => {
	return <Icon name="coze" />;
};

export const CozeComponent: React.FC<NodeComponentProps<CozeNode>> = observer(({ node }) => {
	return (
		<div>
			<Handle id={`${node.id}-target`} type="target" className="base-handle" position={Position.Left} />
			<Handle id={`${node.id}-source`} type="source" className="base-handle" position={Position.Right} />
		</div>
	);
});

export const CozeSet: React.FC<NodeComponentProps<CozeNode>> = observer(({ node }) => {
	const enableVars = node.enableVars.reverse();

	return (
		<div className="custom-node-set-wrap code-node">
			<div className="input-var-wrap">
				<b className="handle-name">访问令牌</b>
				<Tooltip
					content={
						<>
							<Link target="_blank" href="https://www.coze.cn/open/oauth/pats">
								去扣子官网获取
							</Link>
						</>
					}
				>
					<IconInfoCircleFill className="info-icon" />
				</Tooltip>
				<Input value={node.data.accessToken} onBlur={(e) => (node.accessToken = e.target.value)} allowClear placeholder="请输入访问令牌" />
			</div>
			<br />
			<div className="input-var-wrap">
				<b className="handle-name">选择扣子工作空间</b>
				<Select value={node.data.spaceId} onChange={(v) => node.changeSpace(v)}>
					{node.spaces?.workspaces.map((item) => (
						<Select.Option key={item.id} value={item.id}>
							<Space>
								<Image style={{ display: 'flex' }} preview={false} src={item.icon_url} width={16} height={16} />
								{item.name}
							</Space>
						</Select.Option>
					))}
				</Select>
			</div>
			<br />
			<div className="input-var-wrap">
				<b className="handle-name">选择要运行的智能体/工作流</b>
				<Select value={node.data.botId} onChange={(v) => (node.data.botId = v)}>
					{node.bots?.space_bots.map((item) => (
						<Select.Option key={item.bot_id} value={item.bot_id} style={{ lineHeight: 1.2, margin: '2px 0', padding: '4px 6px' }}>
							<div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
								<Image style={{ display: 'flex' }} preview={false} src={item.icon_url} width={16} height={16} />
								<span>{item.bot_name}</span>
							</div>
							<span style={{ color: 'var(--color-text-3)' }}>{item.description}</span>
						</Select.Option>
					))}
				</Select>
			</div>
			<br />
			<div className="input-var-wrap">
				<b className="handle-name">对话内容</b>
				<Tooltip
					content={
						<>
							变量使用：{`{{varName}}`} <br /> 符号&quot;/&quot;可呼出变量
						</>
					}
				>
					<IconInfoCircleFill className="info-icon" />
				</Tooltip>
				<TextEditor enableVars={enableVars} value={node.data.chatContent} onChange={(v) => (node.data.chatContent = v)} />
			</div>
			<br />
			<div className="out-var-list">
				<b className="handle-name">对话输出</b>
				<Tooltip content="对话输出" position="left">
					<div>
						<InputVar
							value={{ key: node.chatOutput.key, type: node.chatOutput.type }}
							readonlyKey
							onChange={(v) => {
								node.chatOutput.key = v.key;
								node.chatOutput.type = v.type;
							}}
						/>
					</div>
				</Tooltip>
			</div>
		</div>
	);
});
