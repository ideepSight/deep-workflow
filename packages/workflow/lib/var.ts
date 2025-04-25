import { DPEvent, observe } from '../../base';
import type { DPBaseNode } from './baseNode';
import type { DPWorkflow } from './workflow';

// 定义 DPVarData 类型
export enum DPVarType {
	String = 'string',
	Number = 'number',
	// Boolean = 'boolean',
	Object = 'object',
	ArrayString = 'array<string>',
	ArrayNumber = 'array<number>',
	ArrayObject = 'array<object>',
	Any = 'any'
}
export type DPVarData = {
	key: string;
	value?: unknown;
	defaultValue?: string;
	type: DPVarType;
	expression?: string;
};
export class DPVar extends DPEvent {
	@observe
	private _data: DPVarData;
	private _owner?: DPBaseNode | DPWorkflow;

	get data() {
		return this._data;
	}
	set data(val) {
		this._data = val;
	}
	get key() {
		return this._data.key;
	}
	set key(val) {
		this._data.key = val;
	}
	get value() {
		return this._data.value;
	}
	set value(val) {
		this._data.value = val;
	}
	get type() {
		return this._data.type;
	}
	set type(val) {
		this._data.type = val;
	}
	get owner() {
		return this._owner;
	}

	constructor(data: DPVarData, owner: DPBaseNode | DPWorkflow) {
		super();
		this._data = data;
		this._owner = owner;
		this._owner.vars.push(this);
	}
}
