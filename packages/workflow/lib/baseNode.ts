import type { FC } from 'react';
import { DPEvent, observe } from '@deep-sight/dp-event';
import { deepObserve, IDisposer } from 'mobx-utils';
import { Node } from '@xyflow/react';
import { DPVar, DPVarData, DPVarType } from './var';
import type { DPWorkflow } from './workflow';
import { RunInputModal } from '../components/RunInputModal';
import { FormItemType, formToContext, t, toContext, toFlatEnableVars } from '../../workflow';

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
	type: BlockEnum | string;
	model: new (owner: DPWorkflow | INodeOwner, data?: DPNodeData | INodeData) => DPBaseNode;
	NodeComponent: FC<NodeComponentProps>;
	SetComponent?: FC<NodeComponentProps>;
	group: 'hide' | 'sys' | 'ai' | 'autoTool' | 'platformApi' | 'custom';
	width?: number;
	height?: number;
	supportMCP?: boolean;
	localPath?: string;
};

export type LogData = { time: number; msg: string; type: 'info' | 'warning' | 'error' };

export type EnableVar = { id: string; node: DPBaseNode; vars: DPVar[] };
export type DPNodeInnerData = {
	dpNodeType: BlockEnum | string;
	title?: string;
	desc?: string;
	inputs?: DPVarData[];
	outputs?: DPVarData[];
	failRetryEnable?: boolean;
	retryInterval?: number;
	maxRetryTimes?: number;
};

export type DPNodeData<T extends DPNodeInnerData = DPNodeInnerData> = Omit<Node<T>, 'id'> & { id?: string };

export interface INodeOwner {
	classType: 'DPWorkflow' | string;
	runlogs?: LogData[];
	NodeTypeItemTypes: { [type: string]: DPRegisterNode };
	emit: (event: string, ...args: any[]) => void;
}

export interface INodeData<T extends DPNodeInnerData = DPNodeInnerData> {
	id?: string;
	position?: { x: number; y: number };
	parentId?: string;
	data: T;
	[key: string]: any;
}

type DPBaseNodeEvent = {
	stoping: () => void;
};

export abstract class DPBaseNode<T extends DPNodeInnerData = DPNodeInnerData> extends DPEvent<DPBaseNodeEvent> {
	static types: { [type: string]: DPRegisterNode } = {};
	static registerType(item: DPRegisterNode) {
		DPBaseNode.types[item.type] = item;
	}

	private _disposer: IDisposer;

	private _owner: DPWorkflow | INodeOwner;

	isInMCP = false;

	get owner() {
		return this._owner;
	}
	set owner(val) {
		this._owner = val;
	}

	@observe
	private _nodeData: DPNodeData<T> | INodeData<T>;
	@observe
	public modified = false; // nodeData、data是否被修改过
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

	get outputs() {
		return this._vars.filter((v) => v.data.flag === 'output');
	}
	get inputs() {
		return this._vars.filter((v) => v.data.flag === 'input');
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
		// node里 new DPVar 会自动push到这
		return this._vars;
	}

	get nodeData() {
		return this._nodeData;
	}

	get parentId() {
		if (this.owner.classType !== 'DPWorkflow') {
			throw new Error('node owner is not DPWorkflow');
		}
		return this.nodeData.parentId;
	}
	get parentNode() {
		if (this.owner.classType !== 'DPWorkflow') {
			throw new Error('node owner is not DPWorkflow');
		}
		return (this.owner as DPWorkflow).dpNodes.find((node) => node.id === this.nodeData.parentId);
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
		return this.owner.NodeTypeItemTypes[this.data.dpNodeType];
	}

	get prevNodes() {
		if (this.owner.classType !== 'DPWorkflow') {
			throw new Error('node owner is not DPWorkflow');
		}
		const owner = this.owner as DPWorkflow;
		// 可用被多个节点连接，所以是数组
		const edges = owner.dpEdges.filter((edge) => edge.target === this.id);
		return edges.map((edge) => owner.dpNodes.find((node) => node.id === edge.source));
	}
	get nextNodes() {
		if (this.owner.classType !== 'DPWorkflow') {
			throw new Error('node owner is not DPWorkflow');
		}
		const owner = this.owner as DPWorkflow;
		const edges = owner.dpEdges.filter((edge) => edge.data.source === this.id);
		return edges.map((edge) => owner.dpNodes.find((node) => node.id === edge.target));
	}
	get nextRunNode() {
		return this._nextRunNode || this.nextNodes[0];
	}
	get enableVars() {
		if (this.owner.classType !== 'DPWorkflow') {
			return [];
		}
		const owner = this.owner as DPWorkflow;
		// 递归获取连接到本节点的所有节点的变量，并按节点的title分组
		let enableVars: EnableVar[] = [];
		const nodes = owner.dpNodes.filter((node) => node.nextNodes.find((n) => n === this));
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
			if (!this.runSingleNeedAssignVars.length) {
				return {};
			}
			if (this.isInMCP) {
				return {};
			}
			const res = await RunInputModal(
				this.runSingleNeedAssignVars.map((v) => {
					const fieldType = v.formInfo?.fieldType || (v.type === DPVarType.Number ? FormItemType.number : FormItemType.textInput);
					return {
						fieldType,
						fieldName: `${v.owner.title}.${v.key}`,
						label: v.name || v.key,
						varType: v.type,
						...v.formInfo
					};
				})
			);
			if (res && Object.keys(res).length) {
				// res 为 {Start:{one: 1}}
				return res;
			} else {
				throw new Error(t('workflow:cancelRun'));
			}
		}
		return toContext(this.enableVars);
	}
	// 节点可通过重写来自行决定独立运行时需要手动赋值的变量
	get runSingleNeedAssignVars(): DPVar[] {
		const needAssignVars: DPVar[] = [];
		const flatEnableVars = toFlatEnableVars(this.enableVars);
		// 使用正则找出this.inputs 和所有flatEnableVars中varFullkey相等的变量名
		const reg = new RegExp(`\\b(${flatEnableVars.map((v) => v.varFullkey).join('|')})\\b`, 'g');
		const matchs = this.inputs
			.map((v) => v.expression)
			.join(';')
			.match(reg);
		if (matchs) {
			matchs.forEach((v) => {
				const findit = flatEnableVars.find((fv) => fv.varFullkey === v);
				findit && needAssignVars.push(findit.value);
			});
		}
		// 使用正则找出this.outputs的expression里和flatEnableVars中varFullkey相等的变量名
		const matchs2 = this.outputs
			.map((v) => v.expression)
			.join(';')
			.match(reg);
		if (matchs2) {
			matchs2.forEach((v) => {
				const findit = flatEnableVars.find((fv) => fv.varFullkey === v);
				findit && needAssignVars.push(findit.value);
			});
		}
		return needAssignVars;
	}

	constructor(owner: DPWorkflow | INodeOwner, nodeData: DPNodeData<T> | INodeData<T>) {
		super();
		this._nodeData = nodeData;
		this._owner = owner;
		if (!this.data.retryInterval) {
			this.data.retryInterval = 1000;
		}
		if (!this.data.maxRetryTimes) {
			this.data.maxRetryTimes = 3;
		}
		if (!this.data.inputs) {
			this.data.inputs = [];
		}
		this.data.inputs.map((v) => new DPVar(v, this));
		if (!this.data.outputs) {
			this.data.outputs = [];
		}
		this.data.outputs.map((v) => new DPVar(v, this));

		if (!this._disposer) {
			this._disposer = deepObserve(this._nodeData, (change, path) => {
				this.modified = true;
				this.owner?.emit('dataChange');
			});
		}
		this.init && this.init(this.data);
	}
	init?(data: T): void;

	addInput(params?: DPVarData) {
		if (params && params?.key) {
			this.data.inputs.push({ ...params, type: params.type || DPVarType.String, flag: 'input' });
		} else {
			this.data.inputs.push({ key: `var${this.data.inputs.length + 1}`, type: DPVarType.String, flag: 'input' });
		}
		new DPVar(this.data.inputs[this.data.inputs.length - 1], this);
	}
	removeInput(input: DPVar) {
		const varIndex = this.data.inputs.findIndex((v) => v.key === input.key);

		console.log(this._vars.length);
		this.data.inputs.splice(varIndex, 1);
		console.log(this._vars.length);
	}
	addOutput(params?: DPVarData) {
		if (params?.key) {
			this.data.outputs.push({ ...params, type: params.type || DPVarType.String, flag: 'output' });
		} else {
			this.data.outputs.push({ key: `var${this.data.outputs.length + 1}`, type: DPVarType.String, flag: 'output' });
		}
		new DPVar(this.data.outputs[this.data.outputs.length - 1], this);
	}
	removeOutput(output: DPVar) {
		const varIndex = this.data.outputs.findIndex((v) => v.key === output.key);
		this.data.outputs.splice(varIndex, 1);
	}

	toCenter() {
		if (this.owner.classType !== 'DPWorkflow') {
			throw new Error('node owner is not DPWorkflow');
		}
		const owner = this.owner as DPWorkflow;
		owner.reactFlowIns.setCenter(this.nodeData.position.x + 100, this.nodeData.position.y + 200, {
			duration: 500,
			zoom: owner.reactFlowIns.getZoom()
		});
	}

	async runSingle() {
		if (this.singleRunning) {
			return;
		}
		if (!this.singleRunAble) {
			throw new Error(t('workflow:baseNode.cannotRunSingle'));
		}
		this.singleRunning = true;
		this.runlogs = [];
		this.owner.runlogs = [];

		await new Promise((resolve) => {
			setTimeout(() => {
				resolve(true);
			}, 300);
		});
		await this.run({ runMode: 'single' });
		this.singleRunning = false;
	}
	async stop() {
		this.emit('stop');
	}

	async run(params?: { runMode: 'single' }) {
		this.runningStatus = NodeRunningStatus.Running;
		this.runlog = { time: Date.now(), msg: t('workflow:baseNode.startRun'), type: 'info' };

		if (!this.data.failRetryEnable) {
			try {
				await this.runSelf();
				this.runningStatus = NodeRunningStatus.Succeeded;
				this.runlog = { time: Date.now(), msg: t('workflow:baseNode.runSuccess'), type: 'info' };
			} catch (error) {
				this.toCenter();
				this.runningStatus = NodeRunningStatus.Failed;
				this.runlog = {
					time: Date.now(),
					msg: t('workflow:baseNode.runFail', { error: error?.message ? t('workflow:baseNode.errorMsg', { msg: error.message }) : '' }),
					type: 'error'
				};
				if (this.errorHandleMode === ErrorHandleMode.Terminated) {
					return;
				}
			}
		} else {
			let retryCount = 0;
			const maxRetries = this.data.maxRetryTimes;

			while (retryCount < maxRetries) {
				try {
					await this.runSelf();
					this.runningStatus = NodeRunningStatus.Succeeded;
					this.runlog = { time: Date.now(), msg: t('workflow:baseNode.runSuccess'), type: 'info' };
					break;
				} catch (error) {
					retryCount++;
					if (retryCount < maxRetries) {
						this.runlog = {
							time: Date.now(),
							msg: t('workflow:baseNode.retrying', {
								count: retryCount,
								error: error?.message ? t('workflow:baseNode.errorMsg', { msg: error?.message }) : ''
							}),
							type: 'warning'
						};
						continue;
					}
					this.runningStatus = NodeRunningStatus.Failed;
					this.toCenter();
					this.runlog = {
						time: Date.now(),
						msg: t('workflow:baseNode.retryFail', {
							max: maxRetries,
							error: error?.message ? t('workflow:baseNode.errorMsg', { msg: error?.message }) : ''
						}),
						type: 'error'
					};
					if (this.errorHandleMode === ErrorHandleMode.Terminated) {
						return;
					}
				}
			}
		}
		if (this.owner.classType !== 'DPWorkflow') {
			return;
		}
		if ((this.owner as DPWorkflow).stoping) {
			this.runlog = { time: Date.now(), msg: t('workflow:baseNode.stopped'), type: 'info' };
			return;
		}
		if (params?.runMode === 'single') {
			return;
		}
		await this.nextRunNode?.run();
	}

	runExpression(expression: string, context: Record<string, any> = {}) {
		try {
			// 创建一个沙盒运行环境 并提供变量上下文
			const res = new Function(`{${Object.keys(context).join(', ')}}`, `return ${expression}`)(context);
			return res;
		} catch (error) {
			console.error(t('workflow:ifElse.expRunError'), error);
			throw new Error(t('workflow:ifElse.expRunFail', { msg: error.message }));
		}
	}

	abstract runSelf(): Promise<any>;
}
