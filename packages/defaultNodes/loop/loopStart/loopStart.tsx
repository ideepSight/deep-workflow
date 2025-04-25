import { observer } from 'mobx-react-lite';
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { NodeComponentProps } from '../../../workflow';
import type { LoopStartNode } from '.';
import { Tooltip } from '@arco-design/web-react';

export const LoopStart: React.FC<NodeComponentProps<LoopStartNode>> = observer(({ node }) => {
	return (
		<div>
			<Tooltip content="循环开始">
				<Handle id={`${node.id}-source`} type="source" className="base-handle" position={Position.Right} />
			</Tooltip>
		</div>
	);
});
