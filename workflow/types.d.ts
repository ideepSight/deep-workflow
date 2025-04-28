import { DPVarType } from './lib';
export declare enum FormItemType {
    textInput = "text-input",
    paragraph = "paragraph",
    select = "select",
    number = "number",
    singleFile = "file",
    multiFiles = "file-list"
}
export type InputFieldData = {
    fieldType: FormItemType;
    fieldName: string;
    label: string;
    varType: DPVarType;
    defaultValue?: string;
    placeholder?: string;
    required: boolean;
    options?: {
        id: string;
        label: string;
    }[];
    filetypes?: string[];
};
