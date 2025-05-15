import { DPBaseNode, BlockEnum, DPNodeInnerData, NodeRunningStatus, t } from '../../workflow';
import { IfElse, IfElseIcon, IfElseSet } from './IfElse';
import type { ExpValue } from './conditionExp';
import { uuid } from 'short-uuid';

export type IfElseNodeInnerData = DPNodeInnerData & { conditions: { type: 'if' | 'else'; id: string; expValue?: ExpValue }[] };

export class IfElseNode extends DPBaseNode<IfElseNodeInnerData> {
	get singleRunAble() {
		return false;
	}
	get conditions() {
		return this.data.conditions;
	}

	init(data: IfElseNodeInnerData) {
		if (!data.conditions) {
			data.conditions = [
				{ type: 'if', id: uuid(), expValue: { mode: 'simple' } },
				{ type: 'else', id: uuid() }
			];
		}
	}

	addCondition() {
		this.data.conditions.unshift({ type: 'if', id: uuid(), expValue: { mode: 'simple' } });
	}

	delCondition(id: string) {
		if (this.data.conditions.length <= 1) {
			return;
		}
		const index = this.data.conditions.findIndex((c) => c.id === id);
		if (index !== -1) {
			this.data.conditions.splice(index, 1);
		}
	}
	async runSelf(): Promise<void> {
		for (const c of this.conditions) {
			if (c.type === 'if') {
				let expression = c.expValue.expression; // "Start.one === Start.two"
				if (c.expValue.mode === 'simple') {
					if (!c.expValue.operator || !c.expValue.left || !c.expValue.right) {
						throw new Error(t('workflow:ifElse.expConfigError'));
					}
					expression = c.expValue.operator.replace('x', `${c.expValue.left}`).replace('y', `${c.expValue.right}`);
				}
				// 执行表达式 创建一个沙盒运行环境
				const res = this.runExpression(expression);
				if (res) {
					this.runningStatus = NodeRunningStatus.Succeeded;
					const edge = this.owner.dpEdges.find((edge) => edge.data.sourceHandle === c.id);
					this._nextRunNode = this.owner.dpNodes.find((node) => node.id === edge.target);
					return;
				}
			} else {
				this.runningStatus = NodeRunningStatus.Succeeded;
				const edge = this.owner.dpEdges.find((edge) => edge.data.sourceHandle === c.id);
				this._nextRunNode = this.owner.dpNodes.find((node) => node.id === edge.target);
				return;
			}
		}
	}
	private runExpression(expression: string): boolean {
		try {
			// 创建一个沙盒运行环境 并提供变量上下文
			const context = this.enableVars.reduce((acc, { node, vars }) => {
				acc[node.title] = vars.reduce((varAcc, v) => {
					varAcc[v.key] = v.value;
					return varAcc;
				}, {});
				return acc;
			}, {});
			const res = new Function(`{${Object.keys(context).join(', ')}}`, `return ${expression}`)(context);
			return res;
		} catch (error) {
			console.error(t('workflow:ifElse.expRunError'), error);
			throw new Error(t('workflow:ifElse.expRunFail', { msg: error.message }));
		}
	}
}

DPBaseNode.registerType({
	type: BlockEnum.IfElse,
	model: IfElseNode,
	icon: IfElseIcon,
	iconColor: '#06aed4',
	NodeComponent: IfElse,
	SetComponent: IfElseSet,
	label: t('workflow:ifElse.label'),
	desc: t('workflow:ifElse.desc'),
	group: 'sys'
});
