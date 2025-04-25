import React, { useEffect, useImperativeHandle } from 'react';
import { DPModalRender, DPModalWrapType } from '../../../workflow/components/DPModal';
import { Form, Input } from '@arco-design/web-react';
import style from './InputAddModal.module.less';
import { FormItemType, InputVarData } from '..';

export const RunInputModal = async (inputDatas: InputVarData[]) => {
	const ModalInner: React.FC<DPModalWrapType> = ({ modalRef }) => {
		const [form] = Form.useForm();
		useImperativeHandle(modalRef, () => ({
			onOk: async () => {
				const values = await form.validate();
				return values;
			}
		}));
		useEffect(() => {
			const defaultValues = inputDatas.reduce((acc, item) => {
				if (item.defaultValue) {
					acc[item.fieldName] = item.defaultValue;
				}
				return acc;
			}, {});
			form.setFieldsValue(defaultValues);
		}, [form]);
		return (
			<div className={style['select-field']}>
				<Form form={form} layout="vertical">
					{inputDatas.map((item) => (
						<React.Fragment key={item.fieldName}>
							{item.fieldType === FormItemType.textInput && (
								<Form.Item label={item.label} field={item.fieldName} rules={[{ required: item.required, message: '请输入' }]}>
									<Input placeholder={item.placeholder} maxLength={20} showWordLimit />
								</Form.Item>
							)}
							{item.fieldType === FormItemType.paragraph && (
								<Form.Item label={item.label} field={item.fieldName} rules={[{ required: item.required, message: '请输入' }]}>
									<Input.TextArea placeholder={item.placeholder} maxLength={200} showWordLimit />
								</Form.Item>
							)}
							{item.fieldType === FormItemType.number && (
								<Form.Item label={item.label} field={item.fieldName} rules={[{ required: item.required, message: '请输入' }]}>
									<Input placeholder={item.placeholder} type="number" />
								</Form.Item>
							)}
							{item.fieldType === FormItemType.url && (
								<Form.Item label={item.label} field={item.fieldName} rules={[{ required: item.required, message: '请输入' }]}>
									<Input placeholder={item.placeholder} type="url" />
								</Form.Item>
							)}
							{item.fieldType === FormItemType.singleFile && (
								<Form.Item label={item.label} field={item.fieldName} rules={[{ required: item.required, message: '请输入' }]}>
									<Input placeholder={item.placeholder} type="file" />
								</Form.Item>
							)}
							{item.fieldType === FormItemType.multiFiles && (
								<Form.Item label={item.label} field={item.fieldName} rules={[{ required: item.required, message: '请输入' }]}>
									<Input placeholder={item.placeholder} type="file" multiple />
								</Form.Item>
							)}
						</React.Fragment>
					))}
				</Form>
			</div>
		);
	};
	return new Promise<Record<string, string | number>>((resolve) => {
		DPModalRender({
			width: 480,
			title: '开始运行',
			onOk: resolve,
			onCancel: () => resolve(null),
			content: <ModalInner />
		});
	});
};
