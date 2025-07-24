import { DPEvent, observe } from '@deep-sight/dp-event';
import type { Connection, ReactFlowInstance } from '@xyflow/react';
import { BlockEnum, DPBaseNode, DPNodeData, DPRegisterNode, LogData, NodeRunningStatus } from './baseNode';
import { uuid } from 'short-uuid';
import { DPBaseEdge, DPEdgeData } from './baseEdge';
import { Message } from '@arco-design/web-react';
import { DPVarData, DPVar } from './var';
import { cloneDeep, debounce } from 'lodash';
import { LoopNode } from '../../defaultNodes';
import { DPHistory } from './history';
import { t } from '..';

export enum ControlMode {
	Pointer = 'pointer',
	Hand = 'hand'
}

export type DPWorkflowData = {
	id?: string;
	title?: string;
	nodes?: DPNodeData[];
	edges?: DPEdgeData[];
	// vars?: DPVarData[]; // 全局变量还没实现完，貌似没啥用
};

type DPWorkflowEvent = {
	save: (data: DPWorkflowData) => void;
	running: () => void;
	dataChange: () => void;
};
export class DPWorkflow extends DPEvent<DPWorkflowEvent> {
	classType = 'DPWorkflow';
	NodeTypeItemTypes = DPBaseNode.types;
	id: string;
	@observe
	title: string;
	@observe
	private _dpNodes: DPBaseNode[] = [];
	@observe
	private _dpEdges: DPBaseEdge[] = [];
	// @observe
	// private _vars: DPVar[] = []; // 全局变量还没实现完，貌似没啥用
	@observe
	controlMode: 'pointer' | 'hand' = 'hand';
	@observe
	running = false;
	@observe
	stoping = false;
	@observe
	private _runlogs: (LogData & { node: DPBaseNode })[] = [];
	@observe
	private _autoSave = true;
	private _prevData: DPWorkflowData;

	public reactFlowIns: ReactFlowInstance;

	public history = new DPHistory(this);

	get runlogs() {
		return this._runlogs;
	}
	set runlogs(val) {
		this._runlogs = val;
	}

	get autoSave() {
		return this._autoSave;
	}
	set autoSave(val: boolean) {
		this._autoSave = val;
	}
	get data() {
		return {
			id: this.id,
			title: this.title,
			nodes: this._dpNodes.map((node) => node.nodeData),
			edges: this._dpEdges.map((edge) => edge.data)
			// vars: this._vars.map((varItem) => varItem.data)
		};
	}
	get dpNodes() {
		return this._dpNodes;
	}
	set dpNodes(val: DPBaseNode[]) {
		this._dpNodes = val;
		this.updateNodes(true);
	}
	get dpEdges() {
		return this._dpEdges;
	}
	set dpEdges(val) {
		this._dpEdges = val;
		this.updateEdges(true);
	}
	// get vars() {
	// 	return this._vars;
	// }
	setNodes(nodes: DPNodeData[]) {}
	setEdges(edges: DPEdgeData[]) {}
	private _updateNodes = debounce((noHistory?: boolean) => {
		const nodeDatas = this._dpNodes.map((node) => node.nodeData);
		this.setNodes(nodeDatas as DPNodeData[]);
		!noHistory && this.history.addStep(); // 添加历史记录
		this.emit('dataChange');
	}, 50);

	private _updateEdges = debounce((noHistory?: boolean) => {
		const edgeDates = this._dpEdges.map((edge) => edge.data);
		this.setEdges(edgeDates as DPEdgeData[]);
		!noHistory && this.history.addStep(); // 添加历史记录
		this.emit('dataChange');
	}, 50);
	updateNodes(noHistory?: boolean) {
		this._updateNodes(noHistory);
	}

	updateEdges(noHistory?: boolean) {
		this._updateEdges(noHistory);
	}
	constructor(data?: DPWorkflowData) {
		super();
		data && this.load(data);
	}
	load(data: DPWorkflowData = {}) {
		this.id = data.id || uuid();
		this.title = data.title || '';
		if (data.nodes?.length) {
			this._dpNodes = data.nodes.map((nodeData) => {
				if (!DPBaseNode.types[nodeData.data.dpNodeType]) {
					throw new Error(`Node type ${nodeData.data.dpNodeType} not registered`);
				}
				return new DPBaseNode.types[nodeData.data.dpNodeType].model(this, nodeData);
			});
		} else {
			this.addNode({
				id: 'start',
				position: { x: 100, y: 0 },
				width: 200,
				data: { dpNodeType: BlockEnum.Start }
			});
		}
		if (data.edges) {
			this._dpEdges = data.edges.map((edgeData) => new DPBaseEdge(edgeData));
		}
		// this._vars = data.vars ? data.vars.map((varData) => new DPVar(varData, this)) : [];
		setTimeout(() => {
			this._handleAutoSave();
		}, 500);
	}

	private _handleAutoSave() {
		this._prevData = cloneDeep(this.data) as DPWorkflowData;
		this.on(
			'dataChange',
			debounce(() => {
				if (!this._autoSave) return;
				const cloneData = cloneDeep(this.data) as DPWorkflowData;
				if (JSON.stringify(this._prevData) !== JSON.stringify(cloneData)) {
					this.save(cloneData);
				}
			}, 500)
		);
	}

	save(cloneData?: DPWorkflowData) {
		this.emit('save', cloneData || this.data);
		this._prevData = cloneData || (cloneDeep(this.data) as DPWorkflowData);
	}

	async run() {
		this.running = true;
		// 清除所有节点运行状态
		this._dpNodes.forEach((node) => (node.runningStatus = NodeRunningStatus.NotStart));
		// 清除所有节点运行日志
		this._dpNodes.forEach((node) => (node.runlogs = []));
		this._runlogs = [];
		this.emit('running');

		// 从start节点开始运行
		const startNode = this._dpNodes.find((node) => node.data.dpNodeType === BlockEnum.Start);
		if (!startNode) {
			Message.error(t('workflow:node.notFoundStart'));
			return;
		}
		await startNode.run();
		this.running = false;
		this.stoping = false;
	}

	// 停止
	async stop() {
		if (!this.running) {
			Message.warning(t('workflow:node.stopped'));
			return;
		}
		this.stoping = true;
		this.dpNodes.forEach((node) => node.runningStatus === NodeRunningStatus.Running && node.stop());
	}

	// addVar(varData: DPVarData) {
	// 	this._vars.push(new DPVar(varData, this));
	// }
	// delVar(key: string) {
	// 	this._vars = this._vars.filter((varItem) => varItem.key !== key);
	// }

	addNode(nodeData: DPNodeData) {
		nodeData.id = nodeData.id || uuid();
		nodeData.type = 'custom';
		const nodeConfig = DPBaseNode.types[nodeData.data.dpNodeType];
		if (!nodeConfig) throw new Error(`Node type ${nodeData.data.dpNodeType} not registered`);

		if (nodeConfig.group !== 'hide') {
			// start、end节点只能有一个
			if (nodeData.data.dpNodeType === BlockEnum.Start || nodeData.data.dpNodeType === BlockEnum.End) {
				const existNode = this._dpNodes.find((node) => node.data.dpNodeType === nodeData.data.dpNodeType);
				if (existNode) {
					Message.warning(t('workflow:node.startOnlyOne'));
					return;
				}
			}

			let counter = 2;
			let newTitle = nodeData.data.title || nodeConfig.label;
			while (this._dpNodes.some(node => node.title === newTitle)) {
				newTitle = `${nodeData.data.title || nodeConfig.label}${counter}`;
				counter++;
			}
			nodeData.data.title = newTitle;

		}
		const newNode = new DPBaseNode.types[nodeData.data.dpNodeType].model(this, nodeData);
		this._dpNodes.push(newNode);
		this.updateNodes();
		return newNode;
	}
	delNode(idOrItem: string | DPBaseNode) {
		const id = typeof idOrItem === 'string' ? idOrItem : idOrItem.nodeData.id;
		const node = this._dpNodes.find((node) => node.id === id);
		let childNodeIds = [];
		if (node instanceof LoopNode) {
			// 循环节点下的子节点要同步删除
			childNodeIds = node.childNodes.map((node) => node.id);
			// 删除 子节点的连线
			this._dpEdges = this._dpEdges.filter((edge) => !childNodeIds.includes(edge.source) && !childNodeIds.includes(edge.target));
		}
		this._dpNodes = this._dpNodes.filter((node) => {
			if (childNodeIds.includes(node.id)) {
				return false;
			}
			return node.nodeData.id !== id;
		});
		this._dpEdges = this._dpEdges.filter((edge) => edge.source !== id && edge.target !== id);
		this.updateNodes();
	}

	onConnect(params: Connection) {
		// 不允许连接到自己、不允许重复连接
		if (this._dpEdges.find((edge) => edge.data.source === params.source && edge.data.target === params.target)) {
			return false;
		}
		if (params.source === params.target) {
			Message.warning(t('workflow:node.connectSelf'));
			return false;
		}
		// 一个桩只能连接一个
		const hasOne = this.dpEdges.find((e) => e.data.sourceHandle === params.sourceHandle);
		if (hasOne) {
			Message.warning(t('workflow:node.connectOnce'));
			return false;
		}
		// 如果有parentId，则只能连接同parentId的节点
		const sourceNode = this._dpNodes.find((node) => node.id === params.source);
		const targetNode = this._dpNodes.find((node) => node.id === params.target);
		if (sourceNode?.nodeData.parentId || targetNode?.nodeData.parentId) {
			if (sourceNode?.nodeData.parentId !== targetNode?.nodeData.parentId) {
				Message.warning(t('workflow:node.connectLoop'));
				return false;
			}
		}
		const edgeId = uuid();
		this._dpEdges.push(new DPBaseEdge({ id: edgeId, ...params, type: 'custom' }));
		this.updateEdges();
	}

	onBeforeDelete(params: { nodes: DPBaseNode[]; edges: DPEdgeData[] }) {
		if (params.nodes.find((n) => n.data.dpNodeType === BlockEnum.Start)) {
			Message.warning(t('workflow:node.deleteStart'));
			return false;
		}
		const delNodeIds = params.nodes.map((n) => n.id);
		const delEdgeIds = params.edges.map((e) => e.id);
		this._dpNodes = this._dpNodes.filter((node) => !delNodeIds.includes(node.id));
		this._dpEdges = this._dpEdges.filter((edge) => !delEdgeIds.includes(edge.id));
		this.updateNodes();
		this.updateEdges();

		return true;
	}

	delEdge(id: string) {
		this._dpEdges = this._dpEdges.filter((edge) => edge.id !== id);
		this.updateEdges();
	}
	handleEdgeEnter(_: React.MouseEvent, edge: DPEdgeData) {
		edge.data.hovering = true;
	}
	handleEdgeLeave(_: React.MouseEvent, edge: DPEdgeData) {
		edge.data.hovering = false;
	}

	handleNodeClick(_: React.MouseEvent, node: DPNodeData) {
		setTimeout(() => {
			this.handleSelectionChange({ nodes: [node], edges: [] });
		});
	}

	handleSelectionChange(selectedItems: { nodes: DPNodeData[]; edges: DPEdgeData[] }) {
		if (selectedItems.nodes.length !== 1) return;
		this._dpNodes
			.filter((dpNode) => dpNode.nodeConfig.group !== 'hide')
			.map((dpNode) => {
				dpNode.active = dpNode.id === selectedItems.nodes[0].id;
			});
	}
	onNodeDragStop(_: React.MouseEvent, node: DPNodeData) {
		this._dpNodes.forEach((dpNode) => {
			if (dpNode.id === node.id) {
				dpNode.nodeData.position = node.position;
			}
		});
	}
}

