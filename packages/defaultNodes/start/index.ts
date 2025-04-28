import { DPNodeInnerData, DPBaseNode, BlockEnum, DPVar, DPVarType, NodeRunningStatus } from '../../workflow/lib';
import { Start, StartIcon, StartSet } from './Start';
import { RunInputModal } from './modal/RunInputModal';

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
export type DPStartNodeInnerData = DPNodeInnerData & { inputFields: InputFieldData[] };

export class DPStartNode extends DPBaseNode<DPStartNodeInnerData> {
	get singleRunAble() {
		return false;
	}
	get inputFields() {
		return this.data.inputFields.map((input) => {
			const dpVar = this.vars.find((item) => item.key === input.fieldName);
			return { dpVar, input };
		});
	}
	init(data: DPStartNodeInnerData) {
		if (!data.inputFields) {
			data.inputFields = [];
		}
		data.inputFields.forEach((inputData) => {
			new DPVar({ key: inputData.fieldName, type: inputData.varType, defaultValue: inputData.defaultValue }, this);
		});
	}
	addInputFields(inputData: InputFieldData) {
		new DPVar({ key: inputData.fieldName, type: inputData.varType, defaultValue: inputData.defaultValue }, this);
		this.data.inputFields.push(inputData);
	}
	updateInput(item: InputFieldData, inputData: InputFieldData) {
		const dpVar = this.vars.find((v) => v.key === item.fieldName);
		dpVar.data = {
			key: inputData.fieldName,
			type: inputData.varType,
			defaultValue: inputData.defaultValue
		};
		this.data.inputFields = this.data.inputFields.map((input) => {
			if (input.fieldName === item.fieldName) {
				return inputData;
			} else {
				return input;
			}
		});
	}
	removeInputFields(input: InputFieldData): void {
		this.data.inputFields = this.data.inputFields.filter((item) => item.fieldName !== input.fieldName);
		this.vars = this.vars.filter((item) => item.key !== input.fieldName);
	}
	async runSelf(): Promise<void> {
		if (this.inputFields.length) {
			const res = await RunInputModal(this.inputFields.map((item) => item.input));
			if (res) {
				// 给后面node用到的变量赋值
				this.vars.forEach((item) => {
					item.value = res[item.key];
				});
			} else {
				this.runningStatus = NodeRunningStatus.Succeeded;
				throw new Error('用户取消了运行');
			}
		}
	}
}
DPBaseNode.registerType({
	type: BlockEnum.Start,
	model: DPStartNode,
	NodeComponent: Start,
	SetComponent: StartSet,
	icon: StartIcon,
	iconColor: '#f79009',
	width: 200,
	label: '开始',
	desc: '流程开始节点',
	group: 'sys'
});
