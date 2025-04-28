import React, { useEffect, useImperativeHandle } from 'react';
import { DPModalRender, DPModalWrapType } from '../../../workflow/components/DPModal';
import { Checkbox, Form, Input, Select } from '@arco-design/web-react';
import style from './InputAddModal.module.less';
import { FormItemType, InputVarData } from '..';
import { DPVarType } from '../../../workflow';
import { SelectOptionSet } from './SelectOptionSet';
import { SelectInputType } from './SelectInputType';

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

const fileTypes = {
	doc: ['TXT', 'MD', 'MDX', 'MARKDOWN', 'PDF', 'HTML', 'XLSX', 'XLS', 'DOC', 'DOCX', 'CSV', 'EML', 'MSG', 'PPTX', 'PPT', 'XML', 'EPUB'],
	img: ['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'SVG'],
	audio: ['MP3', 'M4A', 'WAV', 'AMR', 'MPGA'],
	video: ['MP4', 'MOV', 'MPEG', 'WEBM']
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
		const fieldType = Form.useWatch('fieldType', form);
		return (
			<div className={style['select-field']}>
				<Form form={form} layout="vertical">
					<Form.Item label="字段类型" field="fieldType" rules={[{ required: true, message: '请选择' }]}>
						<SelectInputType />
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
					{(fieldType === FormItemType.textInput || fieldType === FormItemType.paragraph) && (
						<>
							<Form.Item label="默认值" field="defaultValue">
								<Input placeholder="可不填" maxLength={200} />
							</Form.Item>
							<Form.Item label="输入提示语" field="placeholder">
								<Input placeholder="可不填" maxLength={200} />
							</Form.Item>
						</>
					)}
					{fieldType === FormItemType.select && (
						<Form.Item label="选项" field="options">
							<SelectOptionSet />
						</Form.Item>
					)}
					{(fieldType === FormItemType.singleFile || fieldType === FormItemType.multiFiles) && (
						<Form.Item label="支持的文件类型" field="filetypes" required>
							<Select placeholder="选择文件类型" mode="multiple">
								<Select.Option key="doc" value={fileTypes.doc.map((f) => '.' + f).join(',')}>
									文档 {fileTypes.doc.join(',')}
								</Select.Option>
								<Select.Option key="img" value={fileTypes.img.map((f) => '.' + f).join(',')}>
									图片 {fileTypes.img.join(',')}
								</Select.Option>
								<Select.Option key="audio" value={fileTypes.audio.map((f) => '.' + f).join(',')}>
									音频 {fileTypes.audio.join(',')}
								</Select.Option>
								<Select.Option key="video" value={fileTypes.video.map((f) => '.' + f).join(',')}>
									视频 {fileTypes.video.join(',')}
								</Select.Option>
								<Select.Option key="*" value={`*`}>
									所有文件
								</Select.Option>
							</Select>
						</Form.Item>
					)}
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
