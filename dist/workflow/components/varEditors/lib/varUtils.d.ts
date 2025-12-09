import { DPVar, EnableVar } from '../../../lib';
type FlatEnableVarType = {
    varFullkey: string;
    value: DPVar;
};
export declare const toFlatEnableVars: (enableVars: EnableVar[]) => FlatEnableVarType[];
export declare const fullKeyGetVar: (fullKey: string, enableVars: EnableVar[]) => DPVar | null;
export declare const toContext: (enableVars: EnableVar[]) => Record<string, DPVar>;
export declare const formToContext: (formValues: Record<string, string | number>) => Record<string, DPVar>;
export declare const getVarValue: (varValue: DPVar | string, context: any) => any;
export {};
