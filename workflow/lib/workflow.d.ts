import { DPEvent } from '../../base';
import { Connection, ReactFlowInstance } from '@xyflow/react';
import { DPBaseNode, DPNodeData, LogData } from './baseNode';
import { DPBaseEdge, DPEdgeData } from './baseEdge';
import { DPVarData, DPVar } from './var';
import { DPHistory } from './history';
export declare enum ControlMode {
    Pointer = "pointer",
    Hand = "hand"
}
export type DPWorkflowData = {
    id: string;
    title?: string;
    nodes: DPNodeData[];
    edges: DPEdgeData[];
    vars?: DPVarData[];
};
type DPWorkflowEvent = {
    save: (data: DPWorkflowData) => void;
    running: () => void;
};
export declare class DPWorkflow extends DPEvent<DPWorkflowEvent> {
    id: string;
    title: string;
    private _dpNodes;
    private _dpEdges;
    private _vars;
    controlMode: 'pointer' | 'hand';
    running: boolean;
    stoping: boolean;
    private _runlogs;
    private _prevData;
    autoSaveInterval: number;
    private _autoSave;
    private _autoSaveIng;
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
        nodes: DPNodeData<import('./baseNode').DPNodeInnerData>[];
        edges: DPEdgeData[];
        vars: DPVarData[];
    };
    get dpNodes(): DPBaseNode[];
    set dpNodes(val: DPBaseNode[]);
    get dpEdges(): DPBaseEdge[];
    set dpEdges(val: DPBaseEdge[]);
    get vars(): DPVar[];
    setNodes(nodes: DPNodeData[]): void;
    setEdges(edges: DPEdgeData[]): void;
    private _updateNodes;
    private _updateEdges;
    updateNodes(noHistory?: boolean): void;
    updateEdges(noHistory?: boolean): void;
    constructor(data: DPWorkflowData);
    private autoSaveFunc;
    save(): void;
    run(): Promise<void>;
    stop(): Promise<void>;
    addVar(varData: DPVarData): void;
    delVar(key: string): void;
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
