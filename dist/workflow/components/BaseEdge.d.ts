import { EdgeProps } from '@xyflow/react';
import { default as React } from 'react';
import { DPEdgeData } from '../lib/baseEdge';
export declare const edgeTypes: {
    custom: ((props: EdgeProps<DPEdgeData>) => JSX.Element) & {
        displayName: string;
    };
};
declare const _default: React.MemoExoticComponent<((props: EdgeProps<DPEdgeData>) => JSX.Element) & {
    displayName: string;
}>;
export default _default;
