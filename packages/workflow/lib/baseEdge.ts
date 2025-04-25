import { DPEvent, observe } from '../../base';
import { Edge } from '@xyflow/react';

export type DPBaseEdgeInnerData = {
	isInIteration?: boolean;
	isInLoop?: boolean;
	hovering: boolean;
};

export type DPEdgeData = Edge<DPBaseEdgeInnerData>;

export class DPBaseEdge extends DPEvent {
	@observe
	private _data: DPEdgeData;

	get data() {
		return this._data;
	}
	set data(val) {
		this._data = val;
	}
	get id() {
		return this._data.id;
	}
	get source() {
		return this._data.source;	
	}
	get target() {
		return this._data.target;	
	}

	constructor(data: DPEdgeData) {
		super();
		this._data = data;
		this._data.data = { hovering: false };
	}

	toggleHover(val: boolean) {
		this._data.data.hovering = val;
	}
}
