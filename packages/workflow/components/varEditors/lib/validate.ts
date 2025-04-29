import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import type { EnableVar } from '../../../index';
import i18next from 'i18next';

const innerKeywords = [
	'true',
	'false',
	'null',
	'undefined',
	'NaN',
	'Infinity',
	'console',
	'Math',
	'Date',
	'Array',
	'Object',
	'String',
	'Number',
	'Boolean',
	'RegExp',
	'JSON'
];

const globalIdentifiers = typeof window !== 'undefined' ? Object.getOwnPropertyNames(window) : Object.getOwnPropertyNames(globalThis);

const t = i18next.t.bind(i18next);

export const validateExpression = (expr: string, enableVars: EnableVar[]) => {
	// 使用 acorn 解析表达式
	const ast = acorn.parse(`(${expr})`, {
		ecmaVersion: 2020,
		sourceType: 'script'
	});

	// 检查是否包含赋值语句
	let hasAssignment = false;
	walk.simple(ast, {
		AssignmentExpression() {
			hasAssignment = true;
		},
		UpdateExpression() {
			hasAssignment = true;
		}
	});

	if (hasAssignment) {
		throw t('workflow:validate.noAssignment');
	}

	// 检查未定义的变量
	const definedVars = new Map<string, Set<string>>();
	enableVars.forEach(({ node, vars }) => {
		definedVars.set(node.title, new Set(vars.map((v) => v.key)));
	});

	let undefinedVar = '';

	walk.simple(ast, {
		MemberExpression(node) {
			if (node.object.type === 'Identifier' && node.property.type === 'Identifier') {
				const objectName = node.object.name;
				const propertyName = node.property.name;
				const validVars = definedVars.get(objectName);
				if (!validVars || !validVars.has(propertyName)) {
					undefinedVar = `${objectName}.${propertyName}`;
				}
			}
		},
		Identifier(node) {
			// 排除内置对象和关键字
			if (!definedVars.has(node.name) && !innerKeywords.includes(node.name) && !globalIdentifiers.includes(node.name)) {
				undefinedVar = node.name;
			}
		}
	});

	if (undefinedVar) {
		throw t('workflow:validate.undefinedVar', { var: undefinedVar });
	}
};

export const validateCode = (code: string, enableVars: EnableVar[]) => {
	// 使用 acorn 解析表达式
	const ast = acorn.parse(`(${code})`, {
		ecmaVersion: 2020,
		sourceType: 'script'
	});

	// 检查是否存在 main 方法并返回对象
	let mainNode = null;
	walk.simple(
		ast,
		{
			FunctionExpression(node) {
				if (node.id && node.id.name === 'main') {
					mainNode = node;
				}
			}
		},
		walk.base
	);
	if (!mainNode) {
		throw t('workflow:validate.needMain');
	}

	// 检查函数体中的 return 语句
	let returnKeys: { key: string }[] = [];
	walk.simple(mainNode, {
		ReturnStatement(returnNode) {
			if (returnNode.argument && returnNode.argument.type === 'ObjectExpression') {
				returnKeys = returnNode.argument.properties
					.filter((prop): prop is acorn.Property => prop.type === 'Property')
					.map((prop) => {
						if (prop.key.type === 'Identifier') {
							return {
								key: prop.key.name
							};
						}
						return {
							key: ''
						};
					})
					.filter((item) => item.key !== '');
			}
		}
	});
	if (!returnKeys.length) {
		throw t('workflow:validate.mainReturnObject');
	}
	// 如果returnKeys中存在相同的key，则抛出错误
	const uniqueKeys = new Set();
	returnKeys.forEach((item) => {
		if (uniqueKeys.has(item.key)) {
			throw t('workflow:validate.duplicateKey', { key: item.key });
		}
		uniqueKeys.add(item.key);
	});

	// 检查未定义的变量
	const definedVars = new Map<string, Set<string>>();
	enableVars.forEach(({ node, vars }) => {
		definedVars.set(node.title, new Set(vars.map((v) => v.key)));
	});

	let undefinedVar = '';
	walk.simple(ast, {
		MemberExpression(node) {
			if (node.object.type === 'Identifier' && node.property.type === 'Identifier') {
				const objectName = node.object.name;
				const propertyName = node.property.name;
				// 如果 objectName 是全局变量或内置关键字，则跳过校验
				if (globalIdentifiers.includes(objectName) || innerKeywords.includes(objectName)) {
					return;
				}
				const validVars = definedVars.get(objectName);
				if (!validVars || !validVars.has(propertyName)) {
					undefinedVar = `${objectName}.${propertyName}`;
				}
			}
		},
		Identifier(node) {
			// 排除内置对象和关键字
			if (!definedVars.has(node.name) && !innerKeywords.includes(node.name) && !globalIdentifiers.includes(node.name)) {
				undefinedVar = node.name;
			}
		}
	});

	if (undefinedVar) {
		throw t('workflow:validate.undefinedVarCode', { var: undefinedVar });
	}
};
