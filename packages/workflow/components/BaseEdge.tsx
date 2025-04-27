import { BaseEdge as XYBaseEdge, EdgeProps, getBezierPath, Position, EdgeLabelRenderer } from '@xyflow/react';
import React, { Fragment, memo, useContext, useMemo } from 'react';
import { WorkfowContext } from './context';
import { IconCloseCircleFill, IconRight } from '@arco-design/web-react/icon';
import { DPEdgeData } from '../lib/baseEdge';
import './index.less';
import { observer } from 'mobx-react-lite';

const BaseEdge = observer((props: EdgeProps<DPEdgeData>) => {
	const { workflowIns } = useContext(WorkfowContext);
	const { id, data, source, sourceHandleId, target, targetHandleId, sourceX, sourceY, targetX, targetY, selected } = props;

	const [edgePath, labelX, labelY] = getBezierPath({
		sourceX: sourceX - 6,
		sourceY,
		sourcePosition: Position.Right,
		targetX: targetX + 3,
		targetY,
		targetPosition: Position.Left,
		curvature: 0.16
	});

	const stroke = selected || data.hovering ? 'rgb(var(--primary-6))' : '#aaa';

	return (
		<Fragment key={id}>
			<XYBaseEdge
				id={id}
				path={edgePath}
				style={{
					stroke: stroke,
					strokeWidth: 2,
					opacity: 0.8,
					zIndex: 1001,
				}}
			/>
			<EdgeLabelRenderer>
				<div
					className="button-edge"
					style={{
						transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
						display: data.hovering ? 'flex' : 'none'
					}}
				>
					<IconCloseCircleFill onClick={() => workflowIns.delEdge(id)} />
				</div>
				<div className="arrow-edge" style={{ transform: `translate(-50%, -50%) translate(${targetX + 1}px,${targetY + 0.5}px)`, color: stroke }}>
					<IconRight />
				</div>
			</EdgeLabelRenderer>
		</Fragment>
	);
});

export const edgeTypes = {
	custom: BaseEdge
};

export default memo(BaseEdge);
