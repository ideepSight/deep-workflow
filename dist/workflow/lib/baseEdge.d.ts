import { DPEvent } from '../../base';
import { Edge } from '@xyflow/react';
export type DPBaseEdgeInnerData = {
    isInIteration?: boolean;
    isInLoop?: boolean;
    hovering: boolean;
};
export type DPEdgeData = Edge<DPBaseEdgeInnerData>;
export declare class DPBaseEdge extends DPEvent {
    private _data;
    get data(): DPEdgeData;
    set data(val: DPEdgeData);
    get id(): string;
    get source(): string;
    get target(): string;
    constructor(data: DPEdgeData);
    toggleHover(val: boolean): void;
}
