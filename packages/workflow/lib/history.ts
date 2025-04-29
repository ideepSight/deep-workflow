import { DPWorkflow } from '.';
import { DPEvent, observe } from '../../base';
import { DPBaseNode } from './baseNode';
import { DPBaseEdge } from './baseEdge';
import { cloneDeep } from 'lodash';
import { LoopNode } from '../../defaultNodes';

interface HistoryStep {
	nodes: DPBaseNode[];
	edges: DPBaseEdge[];
}

export class DPHistory extends DPEvent {
	@observe
	public steps: HistoryStep[] = [];
	@observe
	public currentIndex = -1;

	private owner: DPWorkflow;
	private maxSteps = 20; // 最大历史记录数

	get redoEnable() {
		return this.currentIndex < this.steps.length - 1;
	}

	get undoEnable() {
		return this.currentIndex > 0;
	}

	constructor(owner: DPWorkflow) {
		super();
		this.owner = owner;
	}

	// 添加新的历史记录
	addStep() {
		const dpNodes = this.owner.dpNodes;
		const loopNode = dpNodes.find((node) => node instanceof LoopNode && node.childNodes.length === 0);
		// 刚新增的loop节点不加入，否则里面的loopStart节点也会加入step
		if (loopNode) {
			return;
		}
		const currentState = {
			nodes: dpNodes.map((node) => {
				// 创建新的DPBaseNode实例并克隆数据
				const clonedNode = new DPBaseNode.types[node.data.dpNodeType].model(null, cloneDeep(node.nodeData));
				return clonedNode;
			}),
			edges: this.owner.dpEdges.map((edge) => {
				return new DPBaseEdge(cloneDeep(edge.data));
			})
		};

		// 如果当前不在最新状态，删除当前位置之后的所有记录
		if (this.currentIndex < this.steps.length - 1) {
			this.steps = this.steps.slice(0, this.currentIndex + 1);
		}

		// 添加新步骤
		this.steps.push(currentState);

		// 限制最大步骤数
		if (this.steps.length > this.maxSteps) {
			this.steps.shift();
		} else {
			this.currentIndex++;
		}
	}

	// 撤销
	undo() {
		if (this.currentIndex <= 0) return false;

		this.currentIndex--;
		this.restoreStep();
		return true;
	}

	// 重做
	redo() {
		if (this.currentIndex >= this.steps.length - 1) return false;

		this.currentIndex++;
		this.restoreStep();
		return true;
	}

	// 还原到指定步骤
	private restoreStep() {
		const step = this.steps[this.currentIndex];
		if (!step) return;

		// 还原节点时设置正确的owner
		const nodes = step.nodes.map((node) => {
			node.owner = this.owner;
			return node;
		});
		this.owner.dpNodes = nodes;

		// 还原边
		this.owner.dpEdges = step.edges;
	}

	// 清空历史记录
	clear() {
		this.steps = [];
		this.currentIndex = -1;
		this.addStep();
	}
}
