import { default as React } from 'react';
import { DPNodeInnerData } from '../lib/baseNode';
import { Node } from '@xyflow/react';
export type WorkflowRetryConfig = {
    maxRetries: number;
    retryInterval: number;
    retryEnabled: boolean;
};
export declare const nodeTypes: {
    custom: (props: Node<DPNodeInnerData>) => JSX.Element;
};
declare const _default: React.MemoExoticComponent<(props: Node<DPNodeInnerData>) => JSX.Element>;
export default _default;
