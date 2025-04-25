import { Modal, ModalProps } from '@arco-design/web-react';
import React, { ReactNode, Ref, isValidElement, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

type ModalElement = Omit<ModalProps, 'onOk'> & {
	width?: number;
	title?: string;
	className?: string;
	footer?: ReactNode;
	onOk?: (res: any) => void;
	onCancel?: () => void;
};

export type OriginModalRef = {
	onOk: () => Promise<any>; // 发给 originModa 的 写在useImperativeHandle里 不与下面 内部发出的共存
	onCancel?: () => Promise<any>;
};

export type DPModalWrapType = {
	modalRef?: Ref<OriginModalRef>;
	onCancel?: () => void; // originModa 内部发出的
	onOk?: (res) => void; // originModa 内部发出的
};

function cloneElement(element: React.ReactNode, props?: any): React.ReactElement {
	if (!isValidElement(element)) return element as React.ReactElement;
	return React.cloneElement(element, typeof props === 'function' ? props(element.props || {}) : props);
}

const DPModalElement: React.FC<ModalElement & { afterClose?: () => void, children }> = (props) => {
	const { width, title, onOk, onCancel, children, className, footer, afterClose } = props;
	const [isModalVisible, setIsModalVisible] = useState<boolean>(true);

	const originModalRef = useRef<OriginModalRef>();

	const close = () => {
		setIsModalVisible(false);
	};
	const handleOk = async (...arg) => {
		let res = arg;
		if (originModalRef.current?.onOk) {
			res = await originModalRef.current.onOk();
		}
		onOk && onOk(res);
		close();
	};
	const handleCancel = async () => {
		if (originModalRef.current?.onCancel) {
			await originModalRef.current.onCancel();
		}
		onCancel && onCancel();
		close();
	};
	const onAfterClose = () => {
		afterClose && afterClose();
	};

	const cloneChildren = React.Children.map(children, (child: React.ReactElement) => {
		if (child) {
			const childProps = { ...child.props };
			childProps.modalRef = originModalRef;
			childProps.onCancel = close;
			childProps.onOk = handleOk;
			return cloneElement(child, childProps);
		}
		return child;
	});

	return (
		<Modal
			{...props}
			className={`dp-modal${className ? '' : ' ' + className}`}
			visible={isModalVisible}
			footer={footer}
			title={title || ' '}
			onOk={handleOk || null}
			onCancel={handleCancel || null}
			style={{ width }}
			afterClose={onAfterClose}
		>
			{cloneChildren}
		</Modal>
	);
};

type ModalRender = ModalElement & { content: ReactNode; className?: string; footer?: ReactNode };

export const DPModalRender = (props: ModalRender) => {
	const { width, title, onOk, onCancel, content, className, footer } = props;
	const div = document.createElement('div');
	document.body.appendChild(div);

	const afterClose = () => {
		const unmountResult = ReactDOM.unmountComponentAtNode(div);
		if (unmountResult && div.parentNode) {
			div.parentNode.removeChild(div);
		}
	};

	ReactDOM.render(
		<DPModalElement
			{...props}
			width={width}
			title={title}
			onOk={onOk}
			onCancel={onCancel}
			className={className}
			footer={footer}
			afterClose={afterClose}
		>
			{content}
		</DPModalElement>,
		div
	);
	return afterClose;
};
