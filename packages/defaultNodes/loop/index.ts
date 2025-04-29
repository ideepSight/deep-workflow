import { DPBaseNode, BlockEnum, DPNodeInnerData, DPVar, DPVarType, EnableVar, NodeRunningStatus } from '../../workflow';
import { Loop, LoopIcon, LoopSet } from './Loop';
import { observe } from '../../base';
import i18next from 'i18next';

export type LoopNodeInnerData = DPNodeInnerData & {
	isByVar: boolean;
	loopVar: { varFullkey?: string; value?: unknown };
	loopCount: number;
};

export class LoopNode extends DPBaseNode<LoopNodeInnerData> {
	get singleRunAble() {
		return true;
	}
	get isByVar() {
		return this.data.isByVar;
	}
	set isByVar(val: boolean) {
		this.data.isByVar = val;
	}
	get loopCount() {
		return this.data.loopCount;
	}
	set loopCount(val: number) {
		this.data.loopCount = val;
	}
	get loopVar() {
		return this.enableVars
			.flatMap(({ node, vars }) =>
				vars.map((varItem) => ({
					varFullkey: `${node.title}.${varItem.key}`,
					value: varItem
				}))
			)
			.find((v) => v.varFullkey === this.data.loopVar.varFullkey)?.value;
	}
	set loopVar(varItem: DPVar | null) {
		this.data.loopVar.varFullkey = varItem ? `${varItem.owner.title}.${varItem.key}` : '';
	}

	get runSingleNeedAssignVars() {
		return [this.loopVar];
	}

	get childNodes() {
		return this.owner.dpNodes.filter((node) => node.nodeData.parentId === this.id);
	}

	get childEnableVars() {
		// 先找到最后一个连线的节点
		// 可能是end节点
		let maybe = this.childNodes.find((node) => node.nodeConfig.type !== BlockEnum.LoopStart && node.nextNodes.length === 0 && node.prevNodes.length !== 0);
		if (!maybe) return [];
		if (maybe.nodeConfig.type === BlockEnum.End) {
			// 取到上一个节点
			maybe = maybe.prevNodes[0];
		}
		// 去掉start节点的
		const enableVars = maybe.enableVars.filter(({ node }) => node.nodeConfig.type !== BlockEnum.LoopStart);
		enableVars.push({ id: maybe.id, node: maybe, vars: maybe.vars });
		return enableVars;
	}

	init(data: LoopNodeInnerData) {
		if (!data.loopVar) {
			data.loopVar = {};
		}
		if (!data.loopCount) {
			data.loopCount = 1;
		}
		if (!data.isByVar) {
			data.isByVar = false;
		}
	}

	async runSelf(): Promise<void> {
		if (this.isByVar) {
			const loopVar = this.loopVar;
			if (!loopVar) {
				throw new Error(i18next.t('workflow:loop.varNotExist'));
			}
			const loopCount = loopVar.value.length;
			// 找到loopStart节点
			const loopStartNode = this.owner.dpNodes.find((node) => node.nodeConfig.type === BlockEnum.LoopStart && node.parentId === this.id);
			for (let i = 0; i < loopCount; i++) {
				const startVarIndex = loopStartNode.vars.find((v) => v.key === 'index');
				const startVarItem = loopStartNode.vars.find((v) => v.key === 'item');
				startVarIndex.value = i;
				startVarItem.value = loopVar.value[i];
				await loopStartNode.run(); // 自然会往下运行
			}
		} else {
			// 找到loopStart节点
			const loopStartNode = this.owner.dpNodes.find((node) => node.nodeConfig.type === BlockEnum.LoopStart && node.parentId === this.id);
			for (let i = 0; i < this.loopCount; i++) {
				const startVarIndex = loopStartNode.vars.find((v) => v.key === 'index');
				startVarIndex.value = i;
				await loopStartNode.run(); // 自然会往下运行
			}
		}
		// 给输出变量赋值
		const outputs = this.outputs;
		for (let i = 0; i < outputs.length; i++) {
			const output = outputs[i];
			output.value = this.runExpression(output.expression);
		}
		this.runningStatus = NodeRunningStatus.Succeeded;
	}

	private runExpression(expression: string): boolean {
		try {
			// 创建一个沙盒运行环境 并提供变量上下文
			const context = this.childEnableVars.reduce((acc, { node, vars }) => {
				acc[node.title] = vars.reduce((varAcc, v) => {
					varAcc[v.key] = v.value;
					return varAcc;
				}, {});
				return acc;
			}, {});
			const res = new Function(`{${Object.keys(context).join(', ')}}`, `return ${expression}`)(context);
			return res;
		} catch (error) {
			console.error(i18next.t('workflow:loop.expRunError'), error);
			throw new Error(i18next.t('workflow:loop.expRunFail', { msg: error.message }));
		}
	}
}
DPBaseNode.registerType({
	type: BlockEnum.Loop,
	model: LoopNode,
	icon: LoopIcon,
	iconColor: '#d712aa',
	NodeComponent: Loop,
	SetComponent: LoopSet,
	label: i18next.t('workflow:loop.label'),
	desc: i18next.t('workflow:loop.desc'),
	group: 'sys',
	width: 500,
	height: 300
});
