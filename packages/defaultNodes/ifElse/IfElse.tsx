import { observer } from 'mobx-react-lite';
import React, { Fragment, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import './index.less';
import { NodeComponentProps } from '../../workflow';
import { IfElseNode } from '.';
import { ConditionExp } from './conditionExp';
import { Button, Divider, Tooltip } from '@arco-design/web-react';
import { IconDelete, IconPlus } from '@arco-design/web-react/icon';
import { Icon } from '@deep-sight/dp-iconfont';
import { useI18n } from '../../workflow/i18n';

export const IfElseIcon = () => {
	return <Icon name="fenzhijiedian" />;
};

export const IfElse: React.FC<NodeComponentProps<IfElseNode>> = observer(({ node }) => {
	const { t } = useI18n();
	const conditionElse = node.conditions.filter((c) => c.type === 'else');
	const conditions = [...node.conditions.filter((c) => c.type === 'if'), ...conditionElse];
	useEffect(() => {
		node.owner.updateEdges(true);
		node.owner.updateNodes(true);
	}, [conditions.length, node.owner]);
	return (
		<div className="if-node-wrap">
			<Handle id={`${node.id}-target`} type="target" className="base-handle" position={Position.Left} />
			<div className="condition-list">
				{conditions.map((c) => (
					<div key={c.id} className="cond-name">
						<span className="if-else-label">{c.type === 'if' ? t('workflow:ifElse.if') : t('workflow:ifElse.else')}</span>
						<Handle id={`${c.id}-source`} type="source" className="base-handle" position={Position.Right} />
					</div>
				))}
			</div>
		</div>
	);
});

export const IfElseSet: React.FC<NodeComponentProps<IfElseNode>> = observer(({ node }) => {
	const { t } = useI18n();
	const enableVars = node.enableVars.reverse();

	return (
		<div className="custom-node-set-wrap if-else-node">
			{node.conditions
				.filter((c) => c.type === 'if')
				.map((c) => (
					<Fragment key={c.id}>
						<div className="condition-if">
							<b className="handle-name">{t('workflow:ifElse.if')}</b>
							<ConditionExp enableVars={enableVars} value={c.expValue} onChange={(v) => (c.expValue = v)} />
							<Tooltip content={t('workflow:ifElse.deleteCondition')}>
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
			<Tooltip content={t('workflow:ifElse.addCondition')}>
				<Button type="secondary" size="mini" icon={<IconPlus className="btn-gray-icon" />} className="add-btn" onClick={() => node.addCondition()} />
			</Tooltip>

			<Divider className="light-border" />
			<div className="condition-else">
				<b className="handle-name">{t('workflow:ifElse.else')}</b>
				<br />
				<p style={{ marginTop: 10 }}>{t('workflow:ifElse.elseDescription')}</p>
			</div>
		</div>
	);
});
