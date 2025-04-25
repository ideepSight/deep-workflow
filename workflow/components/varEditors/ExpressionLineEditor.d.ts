import { default as React } from 'react';
import { EnableVar } from '../../../workflow';
interface ExpressionLineEditorProps {
    enableVars: EnableVar[];
    value?: string;
    onChange?: (expression: string) => void;
}
export declare const ExpressionLineEditor: React.FC<ExpressionLineEditorProps>;
export {};
