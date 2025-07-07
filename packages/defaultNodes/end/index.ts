import { DPBaseNode, BlockEnum, t, NodeTypeItems } from '../../workflow';
import { End, EndIcon } from './End';

export class EndNode extends DPBaseNode {
	get singleRunAble() {
		return false;
	}
	async runSelf(): Promise<void> {}
}
NodeTypeItems.registerType({
	type: BlockEnum.End,
	model: EndNode,
	icon: EndIcon,
	iconColor: '#f79009',
	NodeComponent: End,
	SetComponent: null,
	label: t('workflow:end.label'),
	desc: t('workflow:end.desc'),
	group: 'sys'
});
