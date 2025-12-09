import { DPEvent } from '../../dp-event';
import { DPBaseNode } from './baseNode';
import { FormItemProps } from '@arco-design/web-react';
import { FormItemType, InputFieldData } from '../types';
export declare enum DPVarType {
    String = "string",
    Number = "number",
    Boolean = "boolean",
    Object = "object",
    ArrayString = "array<string>",
    ArrayNumber = "array<number>",
    ArrayObject = "array<object>",
    Any = "any"
}
export type DPVarData = {
    key: string;
    value?: any;
    name?: string;
    description?: string;
    type: DPVarType;
    formInfo?: FormItemProps & {
        fieldType: FormItemType;
        label?: string;
        options?: {
            id: string;
            label: string;
        }[];
        filetypes?: string[];
    };
    expression?: string;
    flag?: 'input' | 'output' | string;
};
export declare class DPVar extends DPEvent {
    _data: DPVarData;
    _owner?: DPBaseNode;
    _sourceArray?: DPVarData[];
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
    get name(): string;
    set name(val: string);
    get description(): string;
    set description(val: string);
    get formInfo(): FormItemProps<any, any, string | number | symbol> & {
        fieldType: FormItemType;
        label?: string;
        options?: {
            id: string;
            label: string;
        }[];
        filetypes?: string[];
    };
    set formInfo(val: FormItemProps<any, any, string | number | symbol> & {
        fieldType: FormItemType;
        label?: string;
        options?: {
            id: string;
            label: string;
        }[];
        filetypes?: string[];
    });
    get owner(): DPBaseNode<import('./baseNode').DPNodeInnerData>;
    /**
     * 自动关联 data 所在数组，data 被删时自动删除该 var
     * 支持 splice/pop/shift/索引赋值/length设置/delete 等各种删除方式
     * 但要保证这个数组在owner.data上
     * 否则自己管理vars的删减
     * @param data - 变量数据
     * @param owner - 所属节点
     */
    constructor(data: DPVarData, owner: DPBaseNode);
    toFormData(): InputFieldData;
}
