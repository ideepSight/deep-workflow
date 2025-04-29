import React, { useEffect, useImperativeHandle } from 'react';
import { DPModalRender, DPModalWrapType } from '../../../workflow/components/DPModal';
import { Checkbox, Form, Input, Select } from '@arco-design/web-react';
import style from './InputAddModal.module.less';
import { FormItemType, InputFieldData } from '../../../workflow';
import { DPVarType } from '../../../workflow';
import { SelectOptionSet } from './SelectOptionSet';
import { SelectInputType } from './SelectInputType';
import { useI18n } from '../../../workflow/i18n';

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

export const InputAddModal = async (editValue?: InputFieldData) => {
	const { t } = useI18n();
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
					<Form.Item label={t('workflow:start.inputModal.fieldType')} field="fieldType" rules={[{ required: true, message: t('workflow:start.inputModal.select') }]}>
						<SelectInputType />
					</Form.Item>
					<Form.Item
						label={t('workflow:start.inputModal.varName')}
						field="fieldName"
						onBlur={(e) => {
							if (!form.getFieldValue('label')) form.setFieldValue('label', e.target.value);
						}}
						rules={[
							{ required: true, message: t('workflow:start.inputModal.input') },
							{
								validator(value, callback) {
									if (!/^[a-zA-Z_\u4e00-\u9fa5$][a-zA-Z0-9_\u4e00-\u9fa5$]*$/.test(value)) {
										callback(t('workflow:start.inputModal.pattern'));
									} else {
										callback();
									}
								}
							}
						]}
					>
						<Input placeholder={t('workflow:start.inputModal.patternPlaceholder')} maxLength={20} />
					</Form.Item>
					<Form.Item label={t('workflow:start.inputModal.label')} field="label" required>
						<Input placeholder={t('workflow:start.inputModal.input')} maxLength={20} />
					</Form.Item>
					{(fieldType === FormItemType.textInput || fieldType === FormItemType.paragraph) && (
						<>
							<Form.Item label={t('workflow:start.inputModal.defaultValue')} field="defaultValue">
								<Input placeholder={t('workflow:start.inputModal.optional')} maxLength={200} />
							</Form.Item>
							<Form.Item label={t('workflow:start.inputModal.placeholder')} field="placeholder">
								<Input placeholder={t('workflow:start.inputModal.optional')} maxLength={200} />
							</Form.Item>
						</>
					)}
					{fieldType === FormItemType.select && (
						<Form.Item label={t('workflow:start.inputModal.options')} field="options">
							<SelectOptionSet />
						</Form.Item>
					)}
					{(fieldType === FormItemType.singleFile || fieldType === FormItemType.multiFiles) && (
						<Form.Item label={t('workflow:start.inputModal.filetypes')} field="filetypes" required>
							<Select placeholder={t('workflow:start.inputModal.selectFileType')} mode="multiple">
								<Select.Option key="doc" value={fileTypes.doc.map((f) => '.' + f).join(',')}>
									{t('workflow:start.inputModal.doc')} {fileTypes.doc.join(',')}
								</Select.Option>
								<Select.Option key="img" value={fileTypes.img.map((f) => '.' + f).join(',')}>
									{t('workflow:start.inputModal.img')} {fileTypes.img.join(',')}
								</Select.Option>
								<Select.Option key="audio" value={fileTypes.audio.map((f) => '.' + f).join(',')}>
									{t('workflow:start.inputModal.audio')} {fileTypes.audio.join(',')}
								</Select.Option>
								<Select.Option key="video" value={fileTypes.video.map((f) => '.' + f).join(',')}>
									{t('workflow:start.inputModal.video')} {fileTypes.video.join(',')}
								</Select.Option>
								<Select.Option key="*" value={`*`}>
									{t('workflow:start.inputModal.all')}
								</Select.Option>
							</Select>
						</Form.Item>
					)}
					<Form.Item field="required" triggerPropName="checked">
						<Checkbox>{t('workflow:start.inputModal.required')}</Checkbox>
					</Form.Item>
				</Form>
			</div>
		);
	};
	return new Promise<InputFieldData>((resolve) => {
		DPModalRender({
			width: 500,
			title: editValue ? t('workflow:start.inputModal.editField') : t('workflow:start.inputModal.addField'),
			onOk: resolve,
			onCancel: () => resolve(null),
			content: <ModalInner />
		});
	});
};
