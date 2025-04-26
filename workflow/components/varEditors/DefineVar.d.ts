import { default as React } from 'react';
import { DPVarType, EnableVar } from '../../lib';
type ValueType = {
    key?: string;
    type?: DPVarType;
    expression?: string;
};
export declare const DefineVar: React.FC<{
    value: ValueType;
    disabled?: boolean;
    onChange: (value: ValueType) => void;
    enableVars?: EnableVar[];
}>;
export {};
