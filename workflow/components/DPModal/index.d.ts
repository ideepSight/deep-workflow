import { ModalProps } from '@arco-design/web-react';
import { ReactNode, Ref } from 'react';
type ModalElement = Omit<ModalProps, 'onOk'> & {
    width?: number;
    title?: string;
    className?: string;
    footer?: ReactNode;
    onOk?: (res: any) => void;
    onCancel?: () => void;
};
export type OriginModalRef = {
    onOk: () => Promise<any>;
    onCancel?: () => Promise<any>;
};
export type DPModalWrapType = {
    modalRef?: Ref<OriginModalRef>;
    onCancel?: () => void;
    onOk?: (res: any) => void;
};
type ModalRender = ModalElement & {
    content: ReactNode;
    className?: string;
    footer?: ReactNode;
};
export declare const DPModalRender: (props: ModalRender) => () => void;
export {};
