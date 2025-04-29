import { DPBaseNode, BlockEnum } from '../../workflow';
import { End, EndIcon } from './End';
import i18next from 'i18next';

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
	label: i18next.t('workflow:end.label'),
	desc: i18next.t('workflow:end.desc'),
	group: 'sys'
});
