import { default as React } from 'react';
import { EnableVar } from '../../../workflow';
interface CodeEditorProps {
    enableVars: EnableVar[];
    value?: string;
    onChange?: (expression: string) => void;
}
export declare const CodeEditor: React.FC<CodeEditorProps>;
export {};
