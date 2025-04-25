import dagre from '@dagrejs/dagre';
import { cloneDeep } from 'lodash';
import type { DPNodeData, DPEdgeData } from './lib';
import { DPVarType } from './lib';

export const getLayoutByDagre = (originNodes: DPNodeData[], originEdges: DPEdgeData[]) => {
	const dagreGraph = new dagre.graphlib.Graph();
	dagreGraph.setDefaultEdgeLabel(() => ({}));
	const nodes = cloneDeep(originNodes).filter((node) => !node.parentId && node.type === 'custom');
	const edges = cloneDeep(originEdges).filter((edge) => !edge.data?.isInIteration && !edge.data.isInLoop);
	dagreGraph.setGraph({
		rankdir: 'LR',
		align: 'UL',
		nodesep: 40,
		ranksep: 60,
		ranker: 'tight-tree',
		marginx: 30,
		marginy: 200
	});
	nodes.forEach((node) => {
		dagreGraph.setNode(node.id, {
			width: node.width,
			height: node.height
		});
	});

	edges.forEach((edge) => {
		dagreGraph.setEdge(edge.source, edge.target);
	});

	dagre.layout(dagreGraph);

	return dagreGraph;
};

export const getDPVarTypeOptions = () => {
	return Object.entries(DPVarType).map(([key, value]) => ({
		label: value,
		value: value
	}));
};
