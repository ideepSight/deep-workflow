import { default as React } from 'react';
type Option = {
    id: string;
    label: string;
};
type SelectOptionSetProps = {
    value?: Option[];
    onChange?: (value: Option[]) => void;
};
export declare const SelectOptionSet: React.FC<SelectOptionSetProps>;
export {};
