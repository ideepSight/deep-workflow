import { observer } from 'mobx-react-lite';
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { NodeComponentProps } from '../../workflow';
import { EndNode } from '.';
import { Icon } from '../../workflow/components/Icon';

export const EndIcon = () => {
	return <Icon name="zhongdian" />;
};

export const End: React.FC<NodeComponentProps<EndNode>> = observer(() => {
	return (
		<div>
			<Handle type="target" className="base-handle" position={Position.Left} />
		</div>
	);
});
