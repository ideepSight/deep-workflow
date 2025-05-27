import { DPVar, EnableVar } from '../../../lib';

type FlatEnableVarType = {
	varFullkey: string;
	value: DPVar;
};
export const toFlatEnableVars = (enableVars: EnableVar[]): FlatEnableVarType[] => {
	return enableVars.flatMap(({ node, vars }) =>
		vars.map((varItem) => ({
			varFullkey: `${node.title}.${varItem.key}`,
			value: varItem
		}))
	);
};

// eg. { Start: {one: 1, two: 2}, Code: {three: 3, four: 4} }
export const toContext = (enableVars: EnableVar[]): Record<string, DPVar> => {
	return enableVars.reduce((acc, { node, vars }) => {
		acc[node.title] = vars.reduce((varAcc, v) => {
			varAcc[v.key] = v.value;
			return varAcc;
		}, {});
		return acc;
	}, {});
};

// 把formValues的 {'Start.one': 1}转成 {Start:{one: 1}}
export const formToContext = (formValues: Record<string, string | number>): Record<string, DPVar> => {
	return Object.entries(formValues).reduce((acc, [key, value]) => {
		const [nodeName, varName] = key.split('.');
		if (!acc[nodeName]) {
			acc[nodeName] = {};
		}
		acc[nodeName][varName] = value;
		return acc;
	}, {});
};

export const getVarExpression = (varValue: DPVar | string | null): string => {
	if (typeof varValue === 'string') {
		return varValue;
	}
	return varValue?.expression || '';
};