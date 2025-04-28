import type { FC, ReactNode } from 'react';
import { DPEvent, observe } from '../../base';
import { Node } from '@xyflow/react';
import { DPVar, DPVarType } from './var';
import type { DPWorkflow } from './workflow';
import { RunInputModal } from '../components/RunInputModal';
import { FormItemType } from '../../workflow';

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

export type LogData = { time: number; msg: string; type: 'info' | 'warning' | 'error' };

export type EnableVar = { id: string; node: DPBaseNode; vars: DPVar[] };
export type DPNodeInnerData = {
	dpNodeType: BlockEnum;
	title?: string;
	desc?: string;
	inputs?: { key: string; type: DPVarType }[];
	outputs?: { key: string; type: DPVarType }[];
};

export type DPNodeData<T extends DPNodeInnerData = DPNodeInnerData> = Omit<Node<T>, 'id'> & { id?: string };

type DPBaseNodeEvent = {
	stoping: () => void;
};
export abstract class DPBaseNode<T extends DPNodeInnerData = DPNodeInnerData> extends DPEvent<DPBaseNodeEvent> {
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
	private _runlogs: LogData[] = [];
	@observe
	private _vars: DPVar[] = [];
	@observe
	public _nextRunNode: DPBaseNode = null;
	@observe
	public singleRunning = false;
	@observe
	private _outputs: DPVar[];
	@observe
	private _inputs: DPVar[];

	get outputs() {
		return this._outputs;
	}

	get inputs() {
		return this._inputs;
	}

	set runlog(val: LogData) {
		this._runlogs.push(val);
		this.owner.runlogs.push({ ...val, node: this });
	}

	get runlogs() {
		return this._runlogs;
	}
	set runlogs(val: LogData[]) {
		this._runlogs = val;
	}
	get vars() {
		return this._vars;
	}
	set vars(val) {
		this._vars = val;
	}
	get nodeData() {
		return this._nodeData;
	}

	get parentId() {
		return this.nodeData.parentId;
	}
	get parentNode() {
		return this.owner.dpNodes.find((node) => node.id === this.nodeData.parentId);
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

	abstract get singleRunAble(): boolean; // 是否可以独立运行

	async getContext() {
		if (this.singleRunning) {
			// runSingleNeedAssignVars需要输入框填写才能独立运行
			if (this.runSingleNeedAssignVars.length) {
				const res = await RunInputModal(
					this.runSingleNeedAssignVars.map((v) => {
						let fieldType = FormItemType.textInput;
						if (v.type === DPVarType.Number) {
							fieldType = FormItemType.number;
						}
						return {
							fieldType,
							fieldName: `${v.owner.title}.${v.key}`,
							label: v.key,
							varType: v.type,
							required: true
						};
					})
				);
				if (res && Object.keys(res).length) {
					// 把res的 {'Start.one': 1}转成 {Start:{one: 1}}
					const context = Object.entries(res).reduce((acc, [key, value]) => {
						const [nodeName, varName] = key.split('.');
						if (!acc[nodeName]) {
							acc[nodeName] = {};
						}
						acc[nodeName][varName] = value;
						return acc;
					}, {});
					return context;
				}
			}
			return {};
		}
		return this.enableVars.reduce((acc, { node, vars }) => {
			acc[node.title] = vars.reduce((varAcc, v) => {
				varAcc[v.key] = v.value;
				return varAcc;
			}, {});
			return acc;
		}, {});
	}
	// 节点自行决定独立运行时需要手动赋值的变量
	get runSingleNeedAssignVars(): DPVar[] {
		return [];
	}

	constructor(owner: DPWorkflow, nodeData: DPNodeData<T>) {
		super();
		this._nodeData = nodeData;
		this.owner = owner;
		if (!this.data.inputs) {
			this.data.inputs = [];
		}
		this._inputs = this.data.inputs.map((v) => new DPVar(v, this));
		if (!this.data.outputs) {
			this.data.outputs = [];
		}
		this._outputs = this.data.outputs.map((v) => new DPVar(v, this));
		this.init && this.init(this.data);
	}
	init?(data: T): void;

	addInput() {
		this.data.inputs.push({ key: `var${this.data.inputs.length + 1}`, type: DPVarType.String });
		this._inputs.push(new DPVar(this.data.inputs[this.data.inputs.length - 1], this));
	}
	removeInput(index: number) {
		this.data.inputs.splice(index, 1);
		this._inputs.splice(index, 1);
	}
	addOutput() {
		this.data.outputs.push({ key: `var${this.data.outputs.length + 1}`, type: DPVarType.String });
		this._outputs.push(new DPVar(this.data.outputs[this.data.outputs.length - 1], this));
	}
	removeOutput(index: number) {
		this.data.outputs.splice(index, 1);
		this._outputs.splice(index, 1);
	}

	toCenter() {
		this.owner.reactFlowIns.setCenter(this.nodeData.position.x, this.nodeData.position.y, { duration: 500, zoom: this.owner.reactFlowIns.getZoom() });
	}

	async runSingle() {
		if (!this.singleRunAble) {
			throw new Error('节点不能独立运行');
		}
		this.singleRunning = true;
		await this.run({ runMode: 'single' });
		this.singleRunning = false;
	}
	async stop() {
		this.emit('stop');
	}

	async run(params?: { runMode: 'single' }) {
		this.runningStatus = NodeRunningStatus.Running;
		this.runlog = { time: Date.now(), msg: `开始运行`, type: 'info' };
		let retryCount = 0;
		const maxRetries = 1;

		while (retryCount < maxRetries) {
			try {
				await this.runSelf();
				this.runningStatus = NodeRunningStatus.Succeeded;
				this.runlog = { time: Date.now(), msg: `运行成功`, type: 'info' };
				break;
			} catch (error) {
				retryCount++;
				this.toCenter();
				if (retryCount < maxRetries) {
					this.runlog = {
						time: Date.now(),
						msg: `运行失败，正在重试第${retryCount}次,${error?.message ? `错误信息：${error.message}` : ''}`,
						type: 'warning'
					};
					continue;
				}
				this.runningStatus = NodeRunningStatus.Failed;
				this.runlog = { time: Date.now(), msg: `重试${maxRetries}次后运行失败,${error?.message ? `错误信息：${error.message}` : ''}`, type: 'error' };
				if (this.errorHandleMode === ErrorHandleMode.Terminated) {
					return;
				}
			}
		}
		if (this.owner.stoping) {
			this.runlog = { time: Date.now(), msg: '中途停止', type: 'info' };
			return;
		}
		if (params.runMode === 'single') {
			return;
		}
		await this.nextRunNode?.run();
	}

	abstract runSelf(): Promise<void>;
}
