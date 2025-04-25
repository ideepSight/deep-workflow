/* eslint-disable @typescript-eslint/ban-types */
import { EventEmitter } from 'events';
import { observable, configure, autorun } from 'mobx';

type DPEventsDefinition = { [event: string]: (...args: any[]) => void };
type DPAny<T> = {
	[key: string]: T;
};
type DPValueType<T> = T extends DPAny<infer U> ? U : never;
type DPUnionToIntersection<Union> = (Union extends any ? (argument: Union) => void : never) extends (argument: infer Intersection) => void
	? Intersection
	: never;
type DPEventsWithoutAny<T extends { [event: string]: (...args: any[]) => void }> = {
	on: DPUnionToIntersection<DPValueType<{ [K in keyof T]: (event: K, listener: T[K]) => any }>>;
	emit: DPUnionToIntersection<DPValueType<{ [K in keyof T]: (event: K, ...args: Parameters<T[K]>) => boolean }>>;
};

type DPEvents<T extends DPEventsDefinition> = DPEventsWithoutAny<T> & {
	on(event: string, listener: (...args: any[]) => void): any;
	emit(event: string, ...args: any[]): any;
};

export type DPConstructor<T> = Function & { prototype: T };

export const SERIALIZE_DATA = Symbol('serializeData');

export abstract class DPEvent<T extends DPEventsDefinition = {}> extends EventEmitter {
	declare on: DPEvents<T>['on'];
	declare off: DPEvents<T>['on'];
	declare once: DPEvents<T>['on'];
	declare addListener: DPEvents<T>['on'];
	declare removeListener: DPEvents<T>['on'];
	declare emit: DPEvents<T>['emit'];

	protected [SERIALIZE_DATA] = observable({});
}

const OBSERVABLE_STATIC_DATA = Symbol('observableStaticData');

configure({
	enforceActions: 'never'
});

export function observe<T extends DPEvent | DPConstructor<DPEvent> | (new (...args: any[]) => DPEvent)>(target: T, property: string) {
	if (typeof target === 'function') {
		// target为构造函数，表示装饰的是静态成员
		// 首次先记录原始的静态初始化数据
		if (!target[OBSERVABLE_STATIC_DATA]) {
			target[OBSERVABLE_STATIC_DATA] = observable({});
		}
		target[OBSERVABLE_STATIC_DATA][property] = target[property];

		Object.defineProperty(target, property, {
			get() {
				const data = target[OBSERVABLE_STATIC_DATA];
				return data[property];
			},
			set(value) {
				const data = target[OBSERVABLE_STATIC_DATA];
				if (data[property] === value) {
					return;
				}
				data[property] = value;
			}
		});
	} else {
		const proto = target;
		if (property in target) {
			return;
		}
		Object.defineProperty(proto, property, {
			get() {
				const data = this[SERIALIZE_DATA];
				return data[property];
			},
			set(value) {
				const data = this[SERIALIZE_DATA];
				if (data[property] === value) {
					return;
				}
				data[property] = value;
			}
		});
	}
}

export function autoUpdate(target: any, propertyKey: any, descriptor: any) {
	const fn = target[propertyKey];
	descriptor.value = function (...args: any) {
		autorun(() => {
			fn.apply(this, args);
		});
	};
}
