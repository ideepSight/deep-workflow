import { DPBaseNode, BlockEnum, DPVar, DPVarType } from '../../../workflow';
import { LoopStart } from './loopStart';
import type { LoopNode } from '..';
import { StartIcon } from '../../start/Start';

export class LoopStartNode extends DPBaseNode {
	private _tmpVars: DPVar[];

	get parentNode() {
		return this.owner.dpNodes.find((node) => node.id === this.nodeData.parentId) as LoopNode;
	}

	get vars() {
		const parentNode = this.parentNode;
		const _vars: DPVar[] = this._tmpVars?.filter((v) => v.key === 'index') || [];
		if (parentNode?.isByVar) {
			if (parentNode.loopVar) {
				const itemVar = this._tmpVars?.find((v) => v.key === 'item');
				if (itemVar) {
					itemVar.type = parentNode.loopVar.type;
					_vars.push(itemVar);
				}
			}
		}
		return _vars;
	}

	init() {
		this._tmpVars = [new DPVar({ key: 'index', type: DPVarType.Number, value: 0 }, this), new DPVar({ key: 'item', type: DPVarType.Any }, this)];
	}

	async runSelf(): Promise<void> {}
}

DPBaseNode.registerType({
	type: BlockEnum.LoopStart,
	model: LoopStartNode,
	icon: StartIcon,
	iconColor: '#f79009',
	NodeComponent: LoopStart,
	SetComponent: null,
	label: 'loopStart',
	desc: '',
	group: 'hide'
});
