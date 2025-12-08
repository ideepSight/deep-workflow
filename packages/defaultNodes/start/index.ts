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
	get outputFields() {
		return this.data.outputs;
	}

	init(data: StartNodeInnerData) {}

	addOutputFields(outputData: InputFieldData) {
		this.addOutput({
			key: outputData.fieldName,
			name: outputData.label,
			type: outputData.varType,
			formInfo: {
				label: outputData.label,
				fieldType: outputData.fieldType,
				defaultValue: outputData.defaultValue,
				options: outputData.options,
				required: outputData.required,
				filetypes: outputData.filetypes
			},
		});
	}
	updateOutputField(item: DPVar, outputData: InputFieldData) {
		item.data = {
			...item.data,
			key: outputData.fieldName,
			name: outputData.label,
			type: outputData.varType,
			formInfo: {
				label: outputData.label,
				fieldType: outputData.fieldType,
				defaultValue: outputData.defaultValue,
				options: outputData.options,
				required: outputData.required,
				filetypes: outputData.filetypes
			}
		};
	}
	removeOutputField(input: DPVar): void {
		this.removeOutput(input);
	}
	async runSelf(): Promise<void> {
		if (this.outputFields.length) {
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
