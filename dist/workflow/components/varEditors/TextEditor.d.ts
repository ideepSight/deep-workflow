import { default as React } from 'react';
import { EnableVar } from '../../../workflow';
interface TextEditorProps {
    enableVars: EnableVar[];
    value?: string;
    onChange?: (text: string) => void;
}
export declare const TextEditor: React.FC<TextEditorProps>;
export {};
