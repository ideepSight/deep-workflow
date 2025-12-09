import { default as React } from 'react';
import { DPVarType, EnableVar } from '../../lib';
import { DPRuleItem } from '../../validator';
type ValueType = {
    key?: string;
    type?: DPVarType;
    expression?: string;
};
export declare const DefineVar: React.FC<{
    value: ValueType;
    empty?: string;
    rule?: DPRuleItem;
    readonlyKey?: boolean;
    disabled?: boolean;
    onChange: (value: ValueType) => void;
    enableVars?: EnableVar[];
}>;
export {};
