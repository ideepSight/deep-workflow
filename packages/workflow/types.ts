import type { FormItemProps } from '@arco-design/web-react';
import { DPVarType } from './lib';

export enum FormItemType {
	textInput = 'text-input',
	paragraph = 'paragraph',
	select = 'select',
	number = 'number',
	singleFile = 'file',
	multiFiles = 'file-list',
	dir = 'dir' // 文件夹
}

export type InputFieldData = Omit<FormItemProps, 'label'> & {
	fieldType: FormItemType;
	fieldName: string;
	varType: DPVarType; // 数据类型
	options?: { id: string; label: string }[];
	filetypes?: string[];
	label?: string;
};
