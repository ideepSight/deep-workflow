import { RuleItem, RuleType, ValidateOption, ValidateSource } from 'async-validator';
interface InternalRuleItem extends Omit<RuleItem, 'validator'> {
    field?: string;
    fullField?: string;
    validator?: RuleItem['validator'] | ExecuteValidator;
}
type ExecuteValidator = (rule: InternalRuleItem, value: any, callback: (error?: string[]) => void, source: ValidateSource, options: ValidateOption) => void;
export type DPRuleItem<T = RuleItem> = Omit<RuleItem, 'type'> & {
    type?: RuleType | T;
};
export type DPRuleType = 'path';
interface Rules<T> {
    [field: string]: DPRuleItem<T> | DPRuleItem<T>[];
}
export declare class DPValidator<T = RuleItem> {
    private schema;
    private rules;
    static register<T>(type: T, validator: ExecuteValidator): void;
    constructor(rules: Rules<T> | DPRuleItem<T> | DPRuleItem<T>[]);
    validate(value: Record<string, any>): Promise<void>;
    validate(value: any): Promise<void>;
}
export {};
