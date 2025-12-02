import { DPEvent, observe } from '@deep-sight/dp-event';
import type { DPBaseNode } from './baseNode';
import type { FormItemProps } from '@arco-design/web-react';
import type { FormItemType, InputFieldData } from '../types';

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
	name?: string;
	description?: string;
	type: DPVarType;
	formInfo?: FormItemProps & { fieldType: FormItemType; label?: string; options?: { id: string; label: string }[]; filetypes?: string[] };
	expression?: string;
};

// 使用 WeakMap 缓存每个数组的 Proxy 和关联的 DPVar
type ProxyInfo = {
	proxy: DPVarData[];
	vars: Set<DPVar>;
	propName: string;
};
// proxyCache核心功能：为了同一个数组只创建一个 Proxy，避免重复监听
const proxyCache = new WeakMap<DPVarData[], ProxyInfo>();
// 反向映射：Proxy -> 原始数组
const proxyToRaw = new WeakMap<DPVarData[], DPVarData[]>();

/**
 * 检查并删除不存在于数组中的 DPVar
 */
function syncVarsWithArray(rawArray: DPVarData[], vars: Set<DPVar>) {
	const currentDataSet = new Set(rawArray);
	vars.forEach((dpVar) => {
		if (!currentDataSet.has(dpVar._data)) {
			// data 已不在数组中，删除对应的 DPVar
			const idx = dpVar._owner.vars.indexOf(dpVar);
			if (idx !== -1) dpVar._owner.vars.splice(idx, 1);
			vars.delete(dpVar);
		}
	});
}

/**
 * 为数组创建 Proxy，拦截各种删除操作
 */
function createArrayProxy(rawArray: DPVarData[], vars: Set<DPVar>): DPVarData[] {
	return new Proxy(rawArray, {
		// 拦截方法调用：splice, pop, shift 等
		get(target, prop, receiver) {
			const value = Reflect.get(target, prop, receiver);
			if (typeof value !== 'function') return value;

			// 拦截会删除元素的方法
			if (prop === 'splice' || prop === 'pop' || prop === 'shift') {
				return function (...args: any[]) {
					const result = value.apply(target, args);
					// 同步检查并删除不存在的 DPVar
					syncVarsWithArray(target, vars);
					return result;
				};
			}
			return value.bind(target);
		},

		// 拦截索引赋值和 length 设置
		set(target, prop, value, receiver) {
			const result = Reflect.set(target, prop, value, receiver);
			// length 减少或索引赋值可能删除元素
			if (prop === 'length' || !isNaN(Number(prop))) {
				syncVarsWithArray(target, vars);
			}
			return result;
		},

		// 拦截 delete arr[i]
		deleteProperty(target, prop) {
			const result = Reflect.deleteProperty(target, prop);
			syncVarsWithArray(target, vars);
			return result;
		}
	});
}

export class DPVar extends DPEvent {
	@observe
	_data: DPVarData; // 改为内部可访问，供 syncVarsWithArray 使用
	_owner?: DPBaseNode;

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
	get name() {
		return this._data.name;
	}
	set name(val) {
		this._data.name = val;
	}
	get description() {
		return this._data.description;
	}
	set description(val) {
		this._data.description = val;
	}
	get formInfo() {
		return this._data.formInfo;
	}
	set formInfo(val) {
		this._data.formInfo = val;
	}
	get owner() {
		return this._owner;
	}

	/**
	 * 自动关联 data 所在数组，data 被删时自动删除该 var
	 * 支持 splice/pop/shift/索引赋值/length设置/delete 等各种删除方式
	 * 但要保证这个数组在owner.data上
	 * 否则自己管理vars的删减
	 * @param data - 变量数据
	 * @param owner - 所属节点
	 */
	constructor(data: DPVarData, owner: DPBaseNode) {
		super();
		this._data = data;
		this._owner = owner;
		this._owner.vars.push(this);

		// 自动查找 data 所在的数组
		const dataObj = owner.data;
		let sourceArray: DPVarData[] | null = null;
		let propName = '';

		for (const prop of Object.getOwnPropertyNames(dataObj)) {
			const arr = dataObj[prop];
			if (!Array.isArray(arr)) continue;

			// 检查是否已经是 Proxy，获取原始数组
			const rawArr = proxyToRaw.get(arr) || arr;
			if (rawArr.includes(data)) {
				sourceArray = rawArr;
				propName = prop;
				break;
			}
		}

		if (!sourceArray) {
			console.warn('var not observed, need delete by yourself');
			return;
		}

		// 检查是否已有 Proxy
		let proxyInfo = proxyCache.get(sourceArray);
		if (!proxyInfo) {
			// 首次监听该数组，创建 Proxy
			const vars = new Set<DPVar>();
			const proxy = createArrayProxy(sourceArray, vars);
			proxyInfo = { proxy, vars, propName };
			proxyCache.set(sourceArray, proxyInfo);
			proxyToRaw.set(proxy, sourceArray); // 记录反向映射
			// 替换 owner.data 上的数组为 Proxy
			dataObj[propName] = proxy;
		}

		// 注册当前 DPVar
		proxyInfo.vars.add(this);
	}

	toFormData(): InputFieldData {
		return {
			fieldName: this.key,
			varType: this.type,
			// options: this.formInfo.options,
			// filetypes: this.formInfo.filetypes,
			...this.formInfo
		};
	}
}
