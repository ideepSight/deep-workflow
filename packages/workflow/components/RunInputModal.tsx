import React, { useEffect, useImperativeHandle } from 'react';
import { DPModalRender, DPModalWrapType } from './DPModal';
import { Form, Input, Select } from '@arco-design/web-react';
import { FormItemType, InputFieldData } from '../types';

export const RunInputModal = async (inputDatas: InputFieldData[]) => {
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
			<div style={{ marginTop: 10 }}>
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
									<Input placeholder={item.placeholder || '请输入数字'} type="number" />
								</Form.Item>
							)}
							{item.fieldType === FormItemType.select && (
								<Form.Item label={item.label} field={item.fieldName} rules={[{ required: item.required, message: '请选择' }]}>
									<Select options={item.options.map((option) => ({ label: option.label, value: option.label }))} placeholder="请选择" />
								</Form.Item>
							)}
							{item.fieldType === FormItemType.singleFile && (
								<Form.Item label={item.label} field={item.fieldName} rules={[{ required: item.required, message: '请输入' }]}>
									<Input placeholder={item.placeholder || '请选择文件'} type="file" accept={item.filetypes.join(',')} />
								</Form.Item>
							)}
							{item.fieldType === FormItemType.multiFiles && (
								<Form.Item label={item.label} field={item.fieldName} rules={[{ required: item.required, message: '请输入' }]}>
									<Input placeholder={item.placeholder || '请选择文件（多选）'} type="file" accept={item.filetypes.join(',')} multiple />
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
