import { default as React } from 'react';
import { DPWorkflow, DPWorkflowData } from '../lib';
type SelfProps = {
    dpWorkflow: DPWorkflow;
    onSave: (v: DPWorkflowData) => void;
    autoSave?: boolean;
    autoSaveInterval?: number;
};
export declare const Workflow: React.FC<SelfProps>;
export {};
