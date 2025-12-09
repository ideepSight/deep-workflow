import { FormItemProps } from '@arco-design/web-react';
import { DPVarType } from './lib';
export declare enum FormItemType {
    textInput = "text-input",
    radio = "radio",
    select = "select",
    number = "number",
    singleFile = "file",
    multiFiles = "file-list",
    dir = "dir"
}
export type InputFieldData = Omit<FormItemProps, 'label'> & {
    fieldType: FormItemType;
    fieldName: string;
    varType: DPVarType;
    options?: {
        id: string;
        label: string;
    }[];
    filetypes?: string[];
    label?: string;
};
