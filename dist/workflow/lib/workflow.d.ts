import { DPEvent } from '../../dp-event';
import { Connection, ReactFlowInstance } from '@xyflow/react';
import { DPBaseNode, DPNodeData, LogData } from './baseNode';
import { DPBaseEdge, DPEdgeData } from './baseEdge';
import { DPHistory } from './history';
export declare enum ControlMode {
    Pointer = "pointer",
    Hand = "hand"
}
export type DPWorkflowData = {
    id?: string;
    title?: string;
    nodes?: DPNodeData[];
    edges?: DPEdgeData[];
};
type DPWorkflowEvent = {
    save: (data: DPWorkflowData) => void;
    running: () => void;
    dataChange: () => void;
};
export declare class DPWorkflow extends DPEvent<DPWorkflowEvent> {
    classType: string;
    NodeTypeItemTypes: {
        [type: string]: import('./baseNode').DPRegisterNode;
    };
    id: string;
    title: string;
    private _dpNodes;
    private _dpEdges;
    controlMode: 'pointer' | 'hand';
    running: boolean;
    stoping: boolean;
    private _runlogs;
    private _autoSave;
    private _prevData;
    reactFlowIns: ReactFlowInstance;
    history: DPHistory;
    get runlogs(): (LogData & {
        node: DPBaseNode;
    })[];
    set runlogs(val: (LogData & {
        node: DPBaseNode;
    })[]);
    get autoSave(): boolean;
    set autoSave(val: boolean);
    get data(): {
        id: string;
        title: string;
        nodes: (DPNodeData<import('./baseNode').DPNodeInnerData> | import('./baseNode').INodeData<import('./baseNode').DPNodeInnerData>)[];
        edges: DPEdgeData[];
    };
    get dpNodes(): DPBaseNode[];
    set dpNodes(val: DPBaseNode[]);
    get dpEdges(): DPBaseEdge[];
    set dpEdges(val: DPBaseEdge[]);
    setNodes(nodes: DPNodeData[]): void;
    setEdges(edges: DPEdgeData[]): void;
    private _updateNodes;
    private _updateEdges;
    updateNodes(noHistory?: boolean): void;
    updateEdges(noHistory?: boolean): void;
    constructor(data?: DPWorkflowData);
    load(data?: DPWorkflowData): void;
    private _handleAutoSave;
    save(cloneData?: DPWorkflowData): void;
    run(): Promise<void>;
    stop(): Promise<void>;
    addNode(nodeData: DPNodeData): DPBaseNode<import('./baseNode').DPNodeInnerData>;
    delNode(idOrItem: string | DPBaseNode): void;
    onConnect(params: Connection): boolean;
    onBeforeDelete(params: {
        nodes: DPBaseNode[];
        edges: DPEdgeData[];
    }): boolean;
    delEdge(id: string): void;
    handleEdgeEnter(_: React.MouseEvent, edge: DPEdgeData): void;
    handleEdgeLeave(_: React.MouseEvent, edge: DPEdgeData): void;
    handleNodeClick(_: React.MouseEvent, node: DPNodeData): void;
    handleSelectionChange(selectedItems: {
        nodes: DPNodeData[];
        edges: DPEdgeData[];
    }): void;
    onNodeDragStop(_: React.MouseEvent, node: DPNodeData): void;
}
export {};
