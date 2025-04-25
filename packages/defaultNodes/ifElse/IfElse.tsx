import { observer } from 'mobx-react-lite';
import React, { Fragment } from 'react';
import { Handle, Position } from '@xyflow/react';
import './index.less';
import { NodeComponentProps } from '../../workflow';
import { IfElseNode } from '.';
import { ConditionExp } from './conditionExp';
import { Button, Divider, Tooltip } from '@arco-design/web-react';
import { IconDelete, IconPlus } from '@arco-design/web-react/icon';
import { Icon } from '../../workflow/components/Icon';

export const IfElseIcon = () => {
	return <Icon name="fenzhijiedian" />;
};

export const IfElse: React.FC<NodeComponentProps<IfElseNode>> = observer(({ node }) => {
	const conditions = node.conditions.slice().sort((a, b) => (a.type === 'else' ? 1 : -1));
	return (
		<div className="if-node-wrap">
			<Handle type="target" className="base-handle" position={Position.Left} />
			<div className="condition-list">
				{conditions.map((c) => (
					<div key={c.id} className="cond-name">
						<span>{c.type === 'if' ? '如果' : '否则'}</span>
						<Handle id={c.id} type="source" className="base-handle" position={Position.Right} />
					</div>
				))}
			</div>
		</div>
	);
});

export const IfElseSet: React.FC<NodeComponentProps<IfElseNode>> = observer(({ node }) => {
	const enableVars = node.enableVars.reverse();

	return (
		<div className="custom-node-set-wrap if-else-node">
			{node.conditions
				.filter((c) => c.type === 'if')
				.map((c) => (
					<Fragment key={c.id}>
						<div className="condition-if">
							<b className="handle-name">如果</b>
							<ConditionExp enableVars={enableVars} value={c.expValue} onChange={(v) => (c.expValue = v)} />
							<Tooltip content="删除判断">
								<Button
									type="secondary"
									className="del-btn"
									status="danger"
									size="mini"
									icon={<IconDelete />}
									onClick={() => node.delCondition(c.id)}
								/>
							</Tooltip>
						</div>
					</Fragment>
				))}
			<Tooltip content="添加判断">
				<Button type="secondary" size="mini" icon={<IconPlus className="btn-gray-icon" />} className="add-btn" onClick={() => node.addCondition()} />
			</Tooltip>

			<Divider className="light-border" />
			<div className="condition-else">
				<b className="handle-name">否则</b>
				<br />
				<p style={{ marginTop: 10 }}>用于定义当 条件判断 不满足时应执行的逻辑。</p>
			</div>
		</div>
	);
});
