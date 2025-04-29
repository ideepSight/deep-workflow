import { DPWorkflow } from '.';
import { DPEvent } from '../../base';
import { DPBaseNode } from './baseNode';
import { DPBaseEdge } from './baseEdge';
interface HistoryStep {
    nodes: DPBaseNode[];
    edges: DPBaseEdge[];
}
export declare class DPHistory extends DPEvent {
    steps: HistoryStep[];
    currentIndex: number;
    private owner;
    private maxSteps;
    get redoEnable(): boolean;
    get undoEnable(): boolean;
    constructor(owner: DPWorkflow);
    addStep(): void;
    undo(): boolean;
    redo(): boolean;
    private restoreStep;
    clear(): void;
}
export {};
