import { default as React } from 'react';
interface MultiFileInputProps {
    value?: File[];
    onChange?: (files: File[]) => void;
    accept?: string;
    placeholder?: string;
    multiple?: boolean;
}
export declare const MultiFileInput: React.FC<MultiFileInputProps>;
export default MultiFileInput;
