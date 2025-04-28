import { DPVarType } from "./lib";

export enum FormItemType {
	textInput = 'text-input',
	paragraph = 'paragraph',
	select = 'select',
	number = 'number',
	singleFile = 'file',
	multiFiles = 'file-list'
	// dir = 'dir' // 文件夹
}

export type InputFieldData = {
	fieldType: FormItemType;
	fieldName: string;
	label: string; // 显示名称
	varType: DPVarType; // 数据类型
	defaultValue?: string; // 默认值
	placeholder?: string; // 占位符
	required: boolean;
	options?: { id: string; label: string }[];
	filetypes?: string[];
};