import { createContext } from 'react';
import type { DPWorkflow } from '../lib/workflow';

export type DPWorkfowContext = {
	workflowIns?: DPWorkflow;
};
export const WorkfowContext = createContext<DPWorkfowContext>({});
