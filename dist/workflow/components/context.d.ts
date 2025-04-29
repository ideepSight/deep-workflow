import { DPWorkflow } from '../lib/workflow';
export type DPWorkfowContext = {
    workflowIns?: DPWorkflow;
};
export declare const WorkfowContext: import('react').Context<DPWorkfowContext>;
