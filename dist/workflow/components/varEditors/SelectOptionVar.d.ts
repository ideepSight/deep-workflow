import { default as React } from 'react';
import { SelectVarProps, DPVar } from '../../../workflow';
export type SelectOptionVarValue = {
    mode: 'var' | 'option';
    innerValue?: DPVar | string | null;
    optionValue?: string | null;
};
type SelectOptionVarProps = Omit<SelectVarProps, 'value' | 'onChange'> & {
    value?: SelectOptionVarValue;
    onChange?: (value: SelectOptionVarValue) => void;
    options: {
        label: string;
        value: string;
    }[];
    notFoundContent?: React.ReactNode;
};
export declare const SelectOptionVar: React.FC<SelectOptionVarProps>;
export {};
