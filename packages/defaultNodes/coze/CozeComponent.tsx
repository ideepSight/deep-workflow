import { observer } from 'mobx-react-lite';
import React, { useState, useCallback, Fragment } from 'react';
import { Button, Empty, Tooltip, Link } from '@arco-design/web-react';
import { Handle, Position } from '@xyflow/react';
import { Icon } from '@deep-sight/dp-iconfont';
import { CozeNode } from '.';
import { NodeComponentProps, SelectInputVar, SelectInputVarValue } from '@deep-sight/workflow';
import { IconInfoCircleFill } from '@arco-design/web-react/icon';

export const CozeIcon = () => {
	return <Icon name="xuanqu" />;
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
	const handleChangeTokenConfig = useCallback(
		(value: SelectInputVarValue) => {
			node.data.tokenConfig = value;
		},
		[node]
	);
	return (
		<div className="custom-node-set-wrap code-node">
			<div className="input-var-wrap">
				<b className="handle-name">访问令牌</b>
				<Tooltip
					content={
						<>
							<Link href="https://www.coze.cn/open/oauth/pats">去扣子官网获取</Link>
						</>
					}
				>
					<IconInfoCircleFill className="info-icon" />
				</Tooltip>
				<SelectInputVar enableVars={enableVars} value={node.data.tokenConfig} onChange={handleChangeTokenConfig} />
			</div>
		</div>
	);
});
