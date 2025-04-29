import { observer } from 'mobx-react-lite';
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { NodeComponentProps } from '../../../workflow';
import type { LoopStartNode } from '.';
import { Tooltip } from '@arco-design/web-react';
import { useI18n } from '../../../workflow/i18n';

export const LoopStart: React.FC<NodeComponentProps<LoopStartNode>> = observer(({ node }) => {
	const { t } = useI18n();
	return (
		<div>
			<Tooltip content={t('workflow:loopStart.label')}>
				<Handle id={`${node.id}-source`} type="source" className="base-handle" position={Position.Right} />
			</Tooltip>
		</div>
	);
});
