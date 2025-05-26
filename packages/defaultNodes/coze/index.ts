import { DPBaseNode, DPNodeInnerData, DPVar, DPVarData, SelectInputVarValue, toContext } from '@deep-sight/workflow';
import { CozeComponent, CozeIcon, CozeSet } from './CozeComponent';
import { observe } from '@deep-sight/dp-event';
import { CozeAPI, COZE_CN_BASE_URL, ChatStatus, RoleType } from '@coze/api';
// pat_Ee1DXH5fZtNFCzB25And7Am3PteVyr7oVmsiC6qCnsHJrOEdeMCttsFgXx08n7nw

export type CozeInnerData = DPNodeInnerData & {
	tokenConfig: SelectInputVarValue;
};

export class CozeNode extends DPBaseNode<CozeInnerData> {
	get singleRunAble() {
		return true;
	}

	init(data: CozeInnerData) {}

	async runSelf(): Promise<void> {}
}

DPBaseNode.registerType({
	type: 'Coze',
	model: CozeNode,
	icon: CozeIcon,
	iconColor: '#f79009',
	NodeComponent: CozeComponent, // 节点显示组件
	SetComponent: CozeSet, // 配置组件
	label: '扣子(Coze)',
	desc: '连接扣子(Coze)智能体或工作流',
	group: 'platformApi'
});
