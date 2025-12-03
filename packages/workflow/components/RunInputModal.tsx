import React, { useEffect, useImperativeHandle } from 'react';
import { DPModalRender, DPModalWrapType } from './DPModal';
import { Form, Input, Radio, Select } from '@arco-design/web-react';
import { FormItemType, InputFieldData } from '../types';
import { t } from '..';
import { MultiFileInput } from './MultiFileInput';

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
								<Form.Item label={item.label} field={item.fieldName} {...item}>
									<Input placeholder={item.placeholder} maxLength={50} showWordLimit />
								</Form.Item>
							)}
							{item.fieldType === FormItemType.radio && (
								<Form.Item label={item.label} field={item.fieldName} {...item}>
									<Radio.Group type="button">
										{item.options.map((option) => (
											<Radio key={option.label} value={option.label}>
												{option.label}
											</Radio>
										))}
									</Radio.Group>
								</Form.Item>
							)}
							{item.fieldType === FormItemType.number && (
								<Form.Item label={item.label} field={item.fieldName} {...item}>
									<Input placeholder={item.placeholder || t('workflow:runInputModal.inputNumber')} type="number" />
								</Form.Item>
							)}
							{item.fieldType === FormItemType.select && (
								<Form.Item label={item.label} field={item.fieldName} {...item}>
									<Select
										mode="multiple"
										options={item.options.map((option) => ({ label: option.label, value: option.label }))}
										placeholder={t('workflow:runInputModal.select')}
										getPopupContainer={() => document.body}
									/>
								</Form.Item>
							)}
							{item.fieldType === FormItemType.singleFile && (
								<Form.Item label={item.label} field={item.fieldName} {...item}>
									<Input
										placeholder={item.placeholder || t('workflow:runInputModal.selectFile')}
										type="file"
										accept={item.filetypes.join(',')}
									/>
								</Form.Item>
							)}
							{item.fieldType === FormItemType.multiFiles && (
								<Form.Item label={item.label} field={item.fieldName} {...item}>
									<MultiFileInput
										placeholder={item.placeholder || t('workflow:runInputModal.selectFiles')}
										accept={item.filetypes.join(',')}
									/>
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
			title: t('workflow:runInputModal.startRun'),
			onOk: resolve,
			onCancel: () => resolve(null),
			content: <ModalInner />
		});
	});
};
