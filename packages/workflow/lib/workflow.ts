import { DPEvent, observe } from '../../base';
import type { Connection, ReactFlowInstance } from '@xyflow/react';
import { BlockEnum, DPBaseNode, DPNodeData } from './baseNode';
import { uuid } from 'short-uuid';
import { DPBaseEdge, DPEdgeData } from './baseEdge';
import { Message } from '@arco-design/web-react';
import { DPVarData, DPVar } from './var';
import { cloneDeep } from 'lodash';
import { LoopNode } from '../../defaultNodes';

export enum ControlMode {
	Pointer = 'pointer',
	Hand = 'hand'
}

export type DPWorkflowData = {
	id: string;
	title?: string;
	nodes: DPNodeData[];
	edges: DPEdgeData[];
	vars?: DPVarData[];
};

type DPWorkflowEvent = {
	save: (data: DPWorkflowData) => void;
};
export class DPWorkflow extends DPEvent<DPWorkflowEvent> {
	id: string;
	@observe
	title: string;
	@observe
	private _dpNodes: DPBaseNode[] = [];
	@observe
	private _dpEdges: DPBaseEdge[] = [];
	@observe
	private _vars: DPVar[] = [];
	@observe
	controlMode: 'pointer' | 'hand' = 'hand';
	@observe
	running = false;

	private _prevData: DPWorkflowData;

	public autoSaveInterval = 1000; // 自动保存间隔，单位：毫秒;
	private _autoSave = false;
	private _autoSaveIng = false;
	public reactFlowIns: ReactFlowInstance;
	get autoSave() {
		return this._autoSave;
	}
	set autoSave(val: boolean) {
		if (val === true) {
			if (val === this._autoSave) {
				return;
			}
			this._autoSave = true;
			if (this._autoSaveIng) {
				return;
			}
			this.autoSaveFunc();
		}
		this._autoSave = val;
	}
	get data() {
		return {
			id: this.id,
			title: this.title,
			nodes: this._dpNodes.map((node) => node.nodeData),
			edges: this._dpEdges.map((edge) => edge.data),
			vars: this._vars.map((varItem) => varItem.data)
		};
	}
	get dpNodes() {
		return this._dpNodes;
	}
	get dpEdges() {
		return this._dpEdges;
	}
	get vars() {
		return this._vars;
	}
	setNodes(nodes: DPNodeData[]) {}
	setEdges(edges: DPEdgeData[]) {}
	updateNodes() {
		this.setNodes(this._dpNodes.map((node) => node.nodeData));
	}
	updateEdges() {
		this.setEdges(this._dpEdges.map((edge) => edge.data));
	}

	constructor(data: DPWorkflowData) {
		super();
		this.id = data.id || uuid();
		this.title = data.title || '';
		if (data.nodes?.length) {
			this._dpNodes = data.nodes.map((nodeData) => {
				DPBaseNode.types[nodeData.data.dpNodeType] || console.error(`Node type ${nodeData.data.dpNodeType} not registered`);
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
		this._vars = data.vars ? data.vars.map((varData) => new DPVar(varData, this)) : [];
		this._prevData = cloneDeep(this.data);
	}

	private async autoSaveFunc() {
		this._autoSaveIng = true;
		// 自动保存，每秒检查this._data是否有变化
		if (!this.autoSave) {
			this._autoSaveIng = false;
			return;
		}
		const cloneData = cloneDeep(this.data);
		if (JSON.stringify(this._prevData) !== JSON.stringify(cloneData)) {
			this.save();
			this._prevData = cloneData;
		}
		await new Promise((resolve) => setTimeout(resolve, this.autoSaveInterval));
		await this.autoSaveFunc(); // 递归调用
	}

	save() {
		this.emit('save', this.data);
	}

	async run() {
		this.running = true;
		// 从start节点开始运行
		const startNode = this._dpNodes.find((node) => node.data.dpNodeType === BlockEnum.Start);
		if (!startNode) {
			Message.error('未找到开始节点');
			return;
		}
		await startNode.run();
		this.running = false;
	}

	addVar(varData: DPVarData) {
		this._vars.push(new DPVar(varData, this));
	}
	delVar(key: string) {
		this._vars = this._vars.filter((varItem) => varItem.key !== key);
	}

	addNode(nodeData: DPNodeData) {
		nodeData.id = nodeData.id || uuid();
		nodeData.type = 'custom';
		const nodeConfig = DPBaseNode.types[nodeData.data.dpNodeType];
		if (!nodeConfig) console.error(`Node type ${nodeData.data.dpNodeType} not registered`);

		if (nodeConfig.group !== 'hide') {
			// start、end节点只能有一个
			if (nodeData.data.dpNodeType === BlockEnum.Start || nodeData.data.dpNodeType === BlockEnum.End) {
				const existNode = this._dpNodes.find((node) => node.data.dpNodeType === nodeData.data.dpNodeType);
				if (existNode) {
					Message.warning('开始节点或结束节点只能有一个');
					return;
				}
			}

			nodeData.data.title = nodeData.data.title || nodeConfig.label;
			// 如果有重名则加 2
			const existNode = this._dpNodes.find((node) => node.title === nodeData.data.title);
			if (existNode) {
				nodeData.data.title = `${nodeData.data.title}2`;
			}
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
			Message.warning('不允许连接到自己');
			return false;
		}
		// 一个桩只能连接一个
		const hasOne = this.dpEdges.find((e) => e.data.sourceHandle === params.sourceHandle);
		if (hasOne) {
			Message.warning('一个连接桩只能连接一个节点');
			return false;
		}
		// 如果有parentId，则只能连接同parentId的节点
		const sourceNode = this._dpNodes.find((node) => node.id === params.source);
		const targetNode = this._dpNodes.find((node) => node.id === params.target);
		if (sourceNode?.nodeData.parentId || targetNode?.nodeData.parentId) {
			if (sourceNode?.nodeData.parentId !== targetNode?.nodeData.parentId) {
				Message.warning('只能连接同一循环节点下的节点');
				return false;
			}
		}
		const edgeId = uuid();
		this._dpEdges.push(new DPBaseEdge({ id: edgeId, ...params, type: 'custom' }));
		this.updateEdges();
	}

	onBeforeDelete(params: { nodes: DPBaseNode[]; edges: DPEdgeData[] }) {
		if (params.nodes.find((n) => n.data.dpNodeType === BlockEnum.Start)) {
			Message.warning('开始节点不能删除');
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
