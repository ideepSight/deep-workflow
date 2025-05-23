import { DPNodeInnerData, DPBaseNode, BlockEnum, DPVar, InputFieldData, NodeRunningStatus, t, DPNodeData, DPWorkflow } from '../../workflow';
import { Start, StartIcon, StartSet } from './Start';
import { RunInputModal } from '../../workflow/components/RunInputModal';

export type StartNodeInnerData = DPNodeInnerData & { inputFields: InputFieldData[] };

export class StartNode extends DPBaseNode<StartNodeInnerData> {
	get nodeData() {
		return super.nodeData as DPNodeData<StartNodeInnerData>;
	}
	get owner() {
		return super.owner as DPWorkflow;
	}
	get singleRunAble() {
		return false;
	}
	get inputFields() {
		return this.data.inputFields.map((input) => {
			const dpVar = this.vars.find((item) => item.key === input.fieldName);
			return { dpVar, input };
		});
	}
	init(data: StartNodeInnerData) {
		if (!data.inputFields) {
			data.inputFields = [];
		}
		data.inputFields.forEach((inputData) => {
			new DPVar({ key: inputData.fieldName, type: inputData.varType, defaultValue: inputData.defaultValue }, this, 'fieldName');
		});
	}
	addInputFields(inputData: InputFieldData) {
		this.data.inputFields.push(inputData);
		new DPVar({ key: inputData.fieldName, type: inputData.varType, defaultValue: inputData.defaultValue }, this, 'fieldName');
	}
	updateInput(item: InputFieldData, inputData: InputFieldData) {
		const dpVar = this.vars.find((v) => v.key === item.fieldName);
		dpVar.data = {
			key: inputData.fieldName,
			type: inputData.varType,
			defaultValue: inputData.defaultValue
		};
		const input = this.data.inputFields.find((item) => item.fieldName === item.fieldName);
		Object.assign(input, inputData)
	}
	removeInputFields(input: InputFieldData): void {
		const index = this.data.inputFields.findIndex((item) => item.fieldName === input.fieldName);
		if (index !== -1) {
			this.data.inputFields.splice(index, 1);
		}
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
	model: StartNode,
	NodeComponent: Start,
	SetComponent: StartSet,
	icon: StartIcon,
	iconColor: '#f79009',
	width: 200,
	label: t('workflow:start.registLabel'),
	desc: t('workflow:start.registDesc'),
	group: 'sys'
});
