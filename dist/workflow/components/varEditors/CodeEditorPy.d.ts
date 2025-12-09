import { default as React } from 'react';
import { EnableVar } from '../../../workflow';
interface CodeEditorProps {
    enableVars: EnableVar[];
    value?: string;
    onChange?: (expression: string) => void;
}
export declare const CodeEditorPy: React.FC<CodeEditorProps>;
export {};
