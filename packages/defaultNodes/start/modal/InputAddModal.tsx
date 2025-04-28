import React, { memo, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { DPModalRender, DPModalWrapType } from '../../../workflow/components/DPModal';
import InputVarTypeIcon from './InputTypeIcon';
import { Checkbox, Form, Input } from '@arco-design/web-react';
import style from './InputAddModal.module.less';
import classNames from 'classnames';
import { FormItemType, InputVarData } from '..';
import { DPVarType } from '../../../workflow';

const SelectInputVar: React.FC<{ value?: FormItemType; onChange?: (v: FormItemType) => void }> = memo(({ value, onChange }) => {
	const [type, setType] = useState<FormItemType>(FormItemType.textInput);

	const handleChange = useCallback(
		(type: FormItemType) => {
			setType(type);
			onChange && onChange(type);
		},
		[onChange]
	);

	useEffect(() => {
		if (value) {
			setType(value);
			onChange && onChange(value);
		} else {
			onChange && onChange(FormItemType.textInput);
		}
	}, [onChange, value]);

	const inputTypes: FormItemType[] = [FormItemType.textInput, FormItemType.paragraph, FormItemType.select, FormItemType.number];

	return (
		<div className={style['select-field-var-wrap']}>
			{inputTypes.map((inputType) => (
				<div key={inputType} className={classNames({ [style['selected']]: type === inputType }, style['item'])} onClick={() => handleChange(inputType)}>
					<InputVarTypeIcon type={inputType} className={style['var-item-icon']} />
					<span>{inputType}</span>
				</div>
			))}
		</div>
	);
});
const fieldTypeToVarType = (fieldType: FormItemType): DPVarType => {
	switch (fieldType) {
		case FormItemType.multiFiles:
			return DPVarType.ArrayString;
		case FormItemType.number:
			return DPVarType.Number;
		default:
			return DPVarType.String;
	}
};
export const InputAddModal = async (editValue?: InputVarData) => {
	const ModalInner: React.FC<DPModalWrapType> = ({ modalRef }) => {
		const [form] = Form.useForm();
		useImperativeHandle(modalRef, () => ({
			onOk: async () => {
				const values = await form.validate();
				return { ...values, varType: fieldTypeToVarType(values.fieldType) };
			}
		}));
		useEffect(() => {
			if (editValue) {
				form.setFieldsValue(editValue);
			}
		}, [form]);
		return (
			<div className={style['select-field']}>
				<Form form={form} layout="vertical">
					<Form.Item label="字段类型" field="fieldType" rules={[{ required: true, message: '请选择' }]}>
						<SelectInputVar />
					</Form.Item>
					<Form.Item
						label="变量名称"
						field="fieldName"
						onBlur={(e) => {
							if (!form.getFieldValue('label')) form.setFieldValue('label', e.target.value);
						}}
						rules={[
							{ required: true, message: '请输入' },
							{
								validator(value, callback) {
									// 按JavaScript变量名规则校验，允许中文、字母、数字、下划线和$，且不能以数字开头
									if (!/^[a-zA-Z_\u4e00-\u9fa5$][a-zA-Z0-9_\u4e00-\u9fa5$]*$/.test(value)) {
										callback('需以字母、中文、_或$开头');
									} else {
										callback();
									}
								}
							}
						]}
					>
						<Input placeholder="以字母、中文、_或$开头" maxLength={20} />
					</Form.Item>
					<Form.Item label="显示名称" field="label" required>
						<Input placeholder="请输入" maxLength={20} />
					</Form.Item>
					<Form.Item label="默认值" field="defaultValue">
						<Input placeholder="可不填" maxLength={200} />
					</Form.Item>
					<Form.Item label="输入提示语" field="placeholder">
						<Input placeholder="可不填" maxLength={200} />
					</Form.Item>
					<Form.Item field="required" triggerPropName="checked">
						<Checkbox>必填</Checkbox>
					</Form.Item>
				</Form>
			</div>
		);
	};
	return new Promise<InputVarData>((resolve) => {
		DPModalRender({
			width: 500,
			title: editValue ? '编辑输入字段' : '添加输入字段',
			onOk: resolve,
			onCancel: () => resolve(null),
			content: <ModalInner />
		});
	});
};
