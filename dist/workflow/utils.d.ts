import { default as dagre } from '@dagrejs/dagre';
import { DPNodeData, DPEdgeData, DPVarType } from './lib';
export declare const getLayoutByDagre: (originNodes: DPNodeData[], originEdges: DPEdgeData[]) => dagre.graphlib.Graph<{}>;
export declare const getDPVarTypeOptions: () => {
    label: DPVarType;
    value: DPVarType;
}[];
