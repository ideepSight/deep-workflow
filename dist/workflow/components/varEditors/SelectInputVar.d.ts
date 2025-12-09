import { default as React } from 'react';
import { SelectVarProps, DPVar } from '../../../workflow';
export type SelectInputVarValue = {
    mode: 'var' | 'input';
    innerValue?: DPVar | string | null;
    inputValue?: string | null;
};
type SelectInputVarProps = Omit<SelectVarProps, 'value' | 'onChange'> & {
    value?: SelectInputVarValue;
    onChange?: (value: SelectInputVarValue) => void;
};
export declare const SelectInputVar: React.FC<SelectInputVarProps>;
export {};
