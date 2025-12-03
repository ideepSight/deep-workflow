import { DPNodeInnerData, DPBaseNode, BlockEnum, DPVar, InputFieldData, NodeRunningStatus, t, DPNodeData, DPWorkflow, DPVarData } from '../../workflow';
import { Start, StartIcon, StartSet } from './Start';
import { RunInputModal } from '../../workflow/components/RunInputModal';

export type StartNodeInnerData = DPNodeInnerData;

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
		return this.data.inputs;
	}

	init(data: StartNodeInnerData) {}

	addInputFields(inputData: InputFieldData) {
		this.addInput({
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
			},
		});
	}
	updateInputField(item: DPVar, inputData: InputFieldData) {
		item.data = {
			...item.data,
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
	}
	removeInputField(input: DPVar): void {
		this.removeInput(input);
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
