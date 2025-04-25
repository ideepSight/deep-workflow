import { default as React, CSSProperties } from 'react';
import { IconType } from './fonts/iconfont-main-type';
type SelfProps = {
    name: IconType;
    symbol?: boolean;
    style?: CSSProperties;
    className?: string;
    title?: string;
    onClick?: (e?: React.MouseEvent<HTMLDivElement>) => void;
};
export declare const Icon: React.FC<SelfProps>;
export {};
