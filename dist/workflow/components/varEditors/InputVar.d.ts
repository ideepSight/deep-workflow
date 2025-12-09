import { default as React } from 'react';
import { DPVarType } from '../../lib';
type ValueType = {
    key?: string;
    type?: DPVarType;
};
export declare const InputVar: React.FC<{
    value: ValueType;
    readonlyKey?: boolean;
    readonlyType?: boolean;
    disabled?: boolean;
    onChange: (value: ValueType) => void;
}>;
export {};
