import { DPNodeInnerData, DPBaseNode, BlockEnum, DPVar, InputFieldData, NodeRunningStatus, t, DPNodeData, DPWorkflow, DPVarData } from '../../workflow';
import { Start, StartIcon, StartSet } from './Start';
import { RunInputModal } from '../../workflow/components/RunInputModal';

export type StartNodeInnerData = DPNodeInnerData & { inputFields: DPVarData[] };

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
		return this.data.inputFields;
	}
	init(data: StartNodeInnerData) {
		if (!data.inputFields) {
			data.inputFields = [];
		}
		data.inputFields.forEach((inputVarData) => {
			new DPVar(inputVarData, this);
		});
	}
	addInputFields(inputData: InputFieldData) {
		this.data.inputFields.push({
			key: inputData.fieldName,
			name: inputData.label,
			type: inputData.varType,
			formInfo: {
				label: inputData.label,
				fieldType: inputData.fieldType,
				defaultValue: inputData.defaultValue,
				options: inputData.options,
				required: inputData.required,
				filetypes: inputData.filetypes
			}
		});
		new DPVar(this.data.inputFields[this.data.inputFields.length - 1], this);
	}
	updateInput(item: DPVar, inputData: InputFieldData) {
		item.data = {
			key: inputData.fieldName,
			name: inputData.label,
			type: inputData.varType,
			formInfo: {
				label: inputData.label,
				fieldType: inputData.fieldType,
				defaultValue: inputData.defaultValue,
				options: inputData.options,
				required: inputData.required,
				filetypes: inputData.filetypes
			}
		};
		// const input = this.data.inputFields.find((item) => item.key === item.key);
		// Object.assign(input, inputData);
	}
	removeInputFields(input: DPVar): void {
		const index = this.vars.findIndex((item) => item.key === input.key);
		if (index !== -1) {
			this.vars.splice(index, 1);
		}
	}
	async runSelf(): Promise<void> {
		if (this.inputFields.length) {
			const res = await RunInputModal(this.vars.map((item) => item.toFormData()));
			if (res) {
				// 给后面node用到的变量赋值
				this.vars.forEach((item) => {
					item.value = res[item.key];
				});
			} else {
				this.runningStatus = NodeRunningStatus.Succeeded;
				throw new Error(t('workflow:cancelRun'));
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
