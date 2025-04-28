import { DPNodeInnerData, DPBaseNode, BlockEnum, DPVar, DPVarType, NodeRunningStatus } from '../../workflow/lib';
import { Start, StartIcon, StartSet } from './Start';
import { RunInputModal } from './modal/RunInputModal';

export enum FormItemType {
	textInput = 'text-input',
	paragraph = 'paragraph',
	select = 'select',
	number = 'number',
	singleFile = 'file',
	multiFiles = 'file-list',
	dir = 'dir' // 文件夹
}

export type InputVarData = {
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
export type DPStartNodeInnerData = DPNodeInnerData & { inputs: InputVarData[] };

export class DPStartNode extends DPBaseNode<DPStartNodeInnerData> {
	get inputs() {
		return this.data.inputs.map((input) => {
			const dpVar = this.vars.find((item) => item.key === input.fieldName);
			return { dpVar, input };
		});
	}
	init(data: DPStartNodeInnerData) {
		if (!data.inputs) {
			data.inputs = [];
		}
		data.inputs.forEach((inputData) => {
			new DPVar({ key: inputData.fieldName, type: inputData.varType, defaultValue: inputData.defaultValue }, this);
		});
	}
	addInput(inputData: InputVarData) {
		new DPVar({ key: inputData.fieldName, type: inputData.varType, defaultValue: inputData.defaultValue }, this);
		this.data.inputs.push(inputData);
	}
	updateInput(item: InputVarData, inputData: InputVarData) {
		const dpVar = this.vars.find((v) => v.key === item.fieldName);
		dpVar.data = {
			key: inputData.fieldName,
			type: inputData.varType,
			defaultValue: inputData.defaultValue
		};
		this.data.inputs = this.data.inputs.map((input) => {
			if (input.fieldName === item.fieldName) {
				return inputData;
			} else {
				return input;
			}
		});
	}
	removeInput(input: InputVarData): void {
		this.data.inputs = this.data.inputs.filter((item) => item.fieldName !== input.fieldName);
		this.vars = this.vars.filter((item) => item.key !== input.fieldName);
	}
	async runSelf(): Promise<void> {
		if (this.inputs.length) {
			const res = await RunInputModal(this.inputs.map((item) => item.input));
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
