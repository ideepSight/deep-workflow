import { DPEvent, observe } from '@deep-sight/dp-event';
import type { DPBaseNode } from './baseNode';
import type { IArrayDidChange, Lambda } from 'mobx';
import { deepObserve } from 'mobx-utils';

// 定义 DPVarData 类型
export enum DPVarType {
	String = 'string',
	Number = 'number',
	Boolean = 'boolean',
	Object = 'object',
	ArrayString = 'array<string>',
	ArrayNumber = 'array<number>',
	ArrayObject = 'array<object>',
	Any = 'any'
}
export type DPVarData = {
	key: string;
	value?: any;
	description?: string;
	defaultValue?: string;
	type: DPVarType;
	expression?: string;
};
export class DPVar extends DPEvent {
	@observe
	private _data: DPVarData;
	private _owner?: DPBaseNode;

	get data() {
		return this._data;
	}
	set data(val) {
		this._data = val;
	}
	get fullKey() {
		return `${this.owner.title}.${this.key}`;
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
	get expression() {
		return this._data.expression;
	}
	set expression(val) {
		this._data.expression = val;
	}
	get description() {
		return this._data.description;
	}
	set description(val) {
		this._data.description = val;
	}
	get owner() {
		return this._owner;
	}

	disposer: Lambda;

	// 注意，这里做了自动关联传入data的所在数组，被删时自动删除该var，
	// 但要保证这个数组在owner.data上
	// 保证这个数组删除这一项data时用的splice等常规数组剔除操作
	// 否则自己管理vars的删减
	constructor(
		data: DPVarData,
		owner: DPBaseNode,
		keyName = 'key' // 新增：数组项的 key 字段名，默认 'key'
	) {
		super();
		this._data = data;
		this._owner = owner;
		this._owner.vars.push(this);

		// 自动反查 owner.data 下所有数组字段
		const dataObj = owner.data;
		let isFound = false;
		for (const prop of Object.getOwnPropertyNames(dataObj)) {
			const arr = dataObj[prop];
			if (Array.isArray(arr)) {
				// 查找是否有元素与自己 key 匹配
				isFound = arr.find((item) => item && item[keyName] === data.key);
				if (isFound) {
					// 监听该数组
					this.disposer = deepObserve(arr, (change: IArrayDidChange) => {
						if (change.type === 'splice' && change.removed.length > 0) {
							const matched = change.removed.some((item) => item && item[keyName] === data.key);
							if (matched) {
								const idx = this._owner.vars.indexOf(this);
								// this._owner.vars[idx] 释放mObserve
								this.disposer && this.disposer();
								if (idx !== -1) this._owner.vars.splice(idx, 1);
							}
						}
					});
					break; // 找到就不再遍历其他数组
				}
			}
		}
		if (!isFound) {
			console.error('var not observed');
		}
	}
}
