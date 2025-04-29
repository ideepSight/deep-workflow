import { DPEvent } from '../../base';
import { DPBaseNode } from './baseNode';
import { DPWorkflow } from './workflow';
export declare enum DPVarType {
    String = "string",
    Number = "number",
    Object = "object",
    ArrayString = "array<string>",
    ArrayNumber = "array<number>",
    ArrayObject = "array<object>",
    Any = "any"
}
export type DPVarData = {
    key: string;
    value?: any;
    defaultValue?: string;
    type: DPVarType;
    expression?: string;
};
export declare class DPVar extends DPEvent {
    private _data;
    private _owner?;
    get data(): DPVarData;
    set data(val: DPVarData);
    get fullKey(): string;
    get key(): string;
    set key(val: string);
    get value(): any;
    set value(val: any);
    get type(): DPVarType;
    set type(val: DPVarType);
    get expression(): string;
    set expression(val: string);
    get owner(): DPBaseNode<import('./baseNode').DPNodeInnerData> | DPWorkflow;
    constructor(data: DPVarData, owner: DPBaseNode | DPWorkflow);
}
