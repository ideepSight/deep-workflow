import { default as React } from 'react';
import { EnableVar } from '../../../workflow';
type SelfProps = {
    enableVars: EnableVar[];
    value: string | null;
    defaultValue?: string | null;
    onChange?: (v: string | null) => void;
    size?: 'small' | 'default';
    varPrefix?: string;
    onSearch?: (text: string, prefix: string) => void;
    needValidate?: boolean;
    placeholder?: string;
    empty?: string;
};
export declare const SimpleExpression: React.FC<SelfProps>;
export {};
