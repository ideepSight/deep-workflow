import { default as React } from 'react';
import { DPVar, EnableVar, DPVarType } from '../../../workflow';
type SelfProps = {
    enableVars: EnableVar[];
    value?: DPVar | null;
    onChange?: (varItem: DPVar | null) => void;
    size?: 'small' | 'default';
    style?: React.CSSProperties;
    filterType?: DPVarType[];
    empty?: string;
};
export declare const SelectVar: React.FC<SelfProps>;
export {};
