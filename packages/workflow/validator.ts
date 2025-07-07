/*
 *
 * 增加新的规则 使用静态方法register
 *
 * 使用方法
 * const valid = new DPValidator({ type: 'experssion', message: 'has error' });
 * valid.validate('hello world');
 *
 */

import Schema, { RuleItem, RuleType, ValidateOption, ValidateSource } from 'async-validator';

interface InternalRuleItem extends Omit<RuleItem, 'validator'> {
	field?: string;
	fullField?: string;
	validator?: RuleItem['validator'] | ExecuteValidator;
}

type ExecuteValidator = (rule: InternalRuleItem, value: any, callback: (error?: string[]) => void, source: ValidateSource, options: ValidateOption) => void;

export type DPRuleItem<T = RuleItem> = Omit<RuleItem, 'type'> & { type?: RuleType | T };

export type DPRuleType = 'path';

interface Rules<T> {
	[field: string]: DPRuleItem<T> | DPRuleItem<T>[];
}

export class DPValidator<T = RuleItem> {
	private schema: Schema;
	private rules: Rules<T>;

	static register<T>(type: T, validator: ExecuteValidator) {
		Schema['register'](type, validator);
	}

	constructor(rules: Rules<T> | DPRuleItem<T> | DPRuleItem<T>[]) {
		if (!rules) {
			throw new Error('Cannot configure a schema with no rules');
		}
		if (typeof rules === 'object' && !Array.isArray(rules) && rules.type === undefined && rules.required === undefined) {
			this.rules = rules as Rules<T>;
			this.schema = new Schema(rules as Record<string, RuleItem | RuleItem[]>);
			return;
		}
		this.schema = new Schema({ name: rules as RuleItem | RuleItem[] });
	}

	validate(value: Record<string, any>): Promise<void>;
	validate(value: any): Promise<void>;
	validate(value) {
		let res = null;
		if (typeof value === 'object' && !Array.isArray(value)) {
			res = Object.keys(value).find((ele) => {
				return Object.keys(this.rules).includes(ele);
			});
		}
		if (res) {
			return this.schema.validate(value);
		}
		return this.schema.validate({ name: value });
	}
}

DPValidator.register<DPRuleType>('path', (rule, value, callback, source, options) => {
	const errors: string[] = [];
	const validate = rule.required || (!rule.required && source.hasOwnProperty(rule.field));
	if (validate) {
		if (!/^[A-z]:\\\\(.+?\\\\)*$/.test(value)) {
			errors.push('path error!');
		}
	}
	callback(errors);
});
