import { DPBaseNode, BlockEnum, DPNodeInnerData, DPVar, DPVarType } from '../../workflow';
import { Code, CodeIcon, CodeSet } from './Code';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

export type CodeNodeInnerData = DPNodeInnerData & {
	outputs: { key: string; type: DPVarType }[];
	code: string;
};

export class CodeNode extends DPBaseNode<CodeNodeInnerData> {
	get code() {
		return this.data.code;
	}
	set code(val) {
		this.data.code = val;
	}

	get outputs() {
		return this.data.outputs.map(({ key }) => this.vars.find((v) => v.key === key));
	}

	init(data: CodeNodeInnerData) {
		if (!data.code) {
			data.code = `
// 可以直接使用前面节点的变量
function main() {

  // 输出变量
  return {
    output1: '输出1来自代码运行',
    output2: '输出2来自代码运行'
  }
}
`;
		}
		if (!data.outputs) {
			data.outputs = [
				{ key: 'output1', type: DPVarType.String },
				{ key: 'output2', type: DPVarType.String }
			];
		}
		data.outputs.forEach((v) => {
			new DPVar(v, this);
		});
	}

	setCodeOutputVars(val: string) {
		// 检查main函数体中的 return 语句，并拿到return对象的所有key
		const ast = acorn.parse(`(${val})`, {
			ecmaVersion: 2020,
			sourceType: 'script'
		});

		let returnKeys: { key: string; type: DPVarType }[] = [];
		walk.simple(ast, {
			FunctionExpression(node) {
				if (node.id.name === 'main') {
					walk.simple(node, {
						ReturnStatement(returnNode) {
							if (returnNode.argument && returnNode.argument.type === 'ObjectExpression') {
								returnKeys = returnNode.argument.properties
									.filter((prop): prop is acorn.Property => prop.type === 'Property')
									.map((prop) => {
										if (prop.key.type === 'Identifier') {
											let type = DPVarType.String;
											if (prop.value.type === 'Literal') {
												if (typeof prop.value.value === 'string') {
													type = DPVarType.String;
												} else if (typeof prop.value.value === 'number') {
													type = DPVarType.Number;
												}
											}
											return {
												key: prop.key.name,
												type: type
											};
										}
										return {
											key: '',
											type: DPVarType.String
										};
									})
									.filter((item) => item.key !== '');
							}
						}
					});
				}
			}
		});

		// 更新 outputVars
		if (returnKeys.length > 0) {
			this.vars = returnKeys.map(({ key, type }) => new DPVar({ key, type }, this));
			this.data.outputs = returnKeys;
		}
	}

	async runSelf(): Promise<void> {
		const context = this.enableVars.reduce((acc, { node, vars }) => {
			acc[node.title] = vars.reduce((varAcc, v) => {
				varAcc[v.key] = v.value;
				return varAcc;
			}, {});
			return acc;
		}, {});
		try {
			// 执行代码 获取返回值 ，保证先运行入口方法main
			const res = await this.runCode(this.code, context);
			// 更新变量值
			this.vars.forEach((v) => {
				v.value = res[v.key];
			});
		} catch (error) {
			console.error('代码执行错误:', error);
			throw new Error(`代码执行失败: ${error.message}`);
		}
	}
	async runCode(code: string, context: any) {
		const fn = new Function(
			`{${Object.keys(context).join(', ')}}`,
			`${code}
			return main();
		`
		);
		return fn(context);
	}
}
DPBaseNode.registerType({
	type: BlockEnum.Code,
	model: CodeNode,
	icon: CodeIcon,
	iconColor: '#296dff',
	NodeComponent: Code,
	SetComponent: CodeSet,
	label: '代码',
	desc: '运行一段代码',
	group: 'sys'
});
