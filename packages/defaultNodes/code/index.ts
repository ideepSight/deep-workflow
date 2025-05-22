import { DPBaseNode, BlockEnum, DPNodeInnerData, DPVar, DPVarType, t } from '../../workflow';
import { Code, CodeIcon, CodeSet } from './Code';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

export type CodeNodeInnerData = DPNodeInnerData & {
	code: string;
};

export class CodeNode extends DPBaseNode<CodeNodeInnerData> {
	get singleRunAble() {
		return true;
	}
	get code() {
		return this.data.code;
	}
	set code(val) {
		this.data.code = val;
	}

	init(data: CodeNodeInnerData) {
		if (!data.code) {
			data.code = `\n// ${t('workflow:code.codeComment')}\nfunction main() {\n\n  // ${t('workflow:code.outputComment')}\n  return {\n    output1: '${t(
				'workflow:code.output1'
			)}',\n    output2: '${t('workflow:code.output2')}'\n  }\n}\n`;
			this.addOutput({ key: 'output1', type: DPVarType.String });
			this.addOutput({ key: 'output2', type: DPVarType.String });
		}
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
			this.outputs = returnKeys.map(({ key, type }) => new DPVar({ key, type }, this));
			this.data.outputs = returnKeys;
		}
	}

	async runSelf(): Promise<void> {
		try {
			// 执行代码 获取返回值 ，保证先运行入口方法main
			const res = await this.runCode(this.code, await this.getContext());
			// 更新变量值
			this.vars.forEach((v) => {
				v.value = res[v.key];
			});
		} catch (error) {
			console.error(t('workflow:code.runError'), error);
			throw new Error(t('workflow:code.runFail', { msg: error.message }));
		}
	}
	async runCode(code: string, context: unknown) {
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
	label: t('workflow:code.label'),
	desc: t('workflow:code.desc'),
	group: 'sys'
});
