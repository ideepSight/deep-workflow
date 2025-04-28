import { DPBaseNode, BlockEnum } from '../../workflow';
import { End, EndIcon } from './End';

export class EndNode extends DPBaseNode {
	get singleRunAble() {
		return false;
	}
	async runSelf(): Promise<void> {}
}
DPBaseNode.registerType({
	type: BlockEnum.End,
	model: EndNode,
	icon: EndIcon,
	iconColor: '#f79009',
	NodeComponent: End,
	SetComponent: null,
	label: '结束',
	desc: '结束节点',
	group: 'sys'
});
