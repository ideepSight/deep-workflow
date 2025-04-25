import type { FC, ReactNode } from 'react';
import { DPEvent, observe } from '../../base';
import { Node } from '@xyflow/react';
import { IconType } from '../../workflow/components/Icon/fonts/iconfont-main-type';
import { DPVar } from './var';
import type { DPWorkflow } from './workflow';

export enum BlockEnum {
	Start = 'start',
	End = 'end',
	IfElse = 'if-else',
	Code = 'code',
	LoopStart = 'loop-start',
	Loop = 'loop',
	HttpRequest = 'http-request',
	Tool = 'tool',

	LLM = 'llm',
	Agent = 'agent',
	Answer = 'answer',
	KnowledgeRetrieval = 'knowledge-retrieval',
	QuestionClassifier = 'question-classifier',
	TemplateTransform = 'template-transform',
	ParameterExtractor = 'parameter-extractor',
	Iteration = 'iteration',
	DocExtractor = 'document-extractor',
	ListFilter = 'list-operator',
	IterationStart = 'iteration-start'
}

export enum ErrorHandleMode {
	Terminated = 'terminated',
	ContinueOnError = 'continue-on-error'
	// RemoveAbnormalOutput = 'remove-abnormal-output'
}

export enum NodeRunningStatus {
	NotStart = 'not-start',
	Waiting = 'waiting',
	Running = 'running',
	Succeeded = 'succeeded',
	Failed = 'failed',
	Exception = 'exception',
	Retry = 'retry'
}
export type NodeComponentProps<T extends DPBaseNode = DPBaseNode> = { node: T };
export type DPRegisterNode = {
	label: string;
	desc: string;
	icon: FC;
	iconColor?: string;
	type: BlockEnum;
	model: new (owner: DPWorkflow, data?: DPNodeData) => DPBaseNode;
	NodeComponent: FC<NodeComponentProps>;
	SetComponent?: FC<NodeComponentProps>;
	group: 'hide' | 'sys' | 'ai' | 'autoTool' | 'platformApi' | 'custom';
	width?: number;
	height?: number;
};

export type EnableVar = { id: string; node: DPBaseNode; vars: DPVar[] };
export type DPNodeInnerData = { dpNodeType: BlockEnum; title?: string; desc?: string };

export type DPNodeData<T extends DPNodeInnerData = DPNodeInnerData> = Omit<Node<T>, 'id'> & { id?: string };

export abstract class DPBaseNode<T extends DPNodeInnerData = DPNodeInnerData> extends DPEvent {
	static types: { [type: string]: DPRegisterNode } = {};
	static registerType(item: DPRegisterNode) {
		DPBaseNode.types[item.type] = item;
	}

	public owner: DPWorkflow;
	@observe
	private _nodeData: DPNodeData<T>;
	@observe
	public active = false;
	@observe
	public runningStatus: NodeRunningStatus = NodeRunningStatus.NotStart;
	@observe
	public errorHandleMode: ErrorHandleMode = ErrorHandleMode.Terminated;
	@observe
	public runLog: { time: number; msg: string; type: 'info' | 'error' }[] = [];
	@observe
	private _vars: DPVar[] = [];
	@observe
	public _nextRunNode: DPBaseNode = null;

	get vars() {
		return this._vars;
	}
	set vars(val) {
		this._vars = val;
	}
	get nodeData() {
		return this._nodeData;
	}

	get data() {
		return this.nodeData.data;
	}
	get id() {
		return this._nodeData.id;
	}
	get title() {
		return this._nodeData.data.title;
	}
	get nodeConfig() {
		return DPBaseNode.types[this.data.dpNodeType];
	}

	get prevNodes() {
		// 可用被多个节点连接，所以是数组
		const edges = this.owner.dpEdges.filter((edge) => edge.target === this.id);
		return edges.map((edge) => this.owner.dpNodes.find((node) => node.id === edge.source));
	}
	get nextNodes() {
		const edges = this.owner.dpEdges.filter((edge) => edge.data.source === this.id);
		return edges.map((edge) => this.owner.dpNodes.find((node) => node.id === edge.target));
	}
	get nextRunNode() {
		return this._nextRunNode || this.nextNodes[0];
	}
	get enableVars() {
		// 递归获取连接到本节点的所有节点的变量，并按节点的title分组
		let enableVars: EnableVar[] = [];
		const nodes = this.owner.dpNodes.filter((node) => node.nextNodes.find((n) => n === this));
		nodes.forEach((node) => {
			enableVars.push({ id: node.id, node, vars: node.vars });
			enableVars = enableVars.concat(node.enableVars);
		});
		return enableVars;
	}

	constructor(owner: DPWorkflow, nodeData: DPNodeData<T>) {
		super();
		this._nodeData = nodeData;
		this.owner = owner;
		this.init && this.init(this._nodeData.data);
	}
	init?(data: T): void;

	toCenter() {
		this.owner.reactFlowIns.setCenter(this.nodeData.position.x, this.nodeData.position.y, { duration: 500, zoom: this.owner.reactFlowIns.getZoom() });
	}

	async run() {
		this.runningStatus = NodeRunningStatus.Running;
		const label = this.nodeConfig.label;
		this.runLog.push({ time: Date.now(), msg: `运行节点 - ${label}`, type: 'info' });
		try {
			await this.runSelf();
			this.runningStatus = NodeRunningStatus.Succeeded;
			this.runLog.push({ time: Date.now(), msg: `运行节点 - ${label} 成功`, type: 'info' });
		} catch (error) {
			this.runningStatus = NodeRunningStatus.Failed;
			this.runLog.push({
				time: Date.now(),
				msg: `运行节点 - ${label} 失败，${error?.message ? `错误信息：${error.message}` : ''}`,
				type: 'error'
			});
			if (this.errorHandleMode === ErrorHandleMode.Terminated) {
				return;
			}
		}
		await this.nextRunNode?.run();
	}
	abstract runSelf(): Promise<void>;

	stop?(): void;
}
