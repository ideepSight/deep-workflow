import { observe } from '@deep-sight/dp-event';
import { DPBaseNode, BlockEnum, DPNodeInnerData, DPVar, DPVarType, t, DPVarData, toContext, toFlatEnableVars } from '../../workflow';
import { Code, CodeIcon, CodeSet } from './Code';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

export type CodeNodeInnerData = DPNodeInnerData & {
	code: string;
	codeOutputs: DPVarData[];
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

	@observe
	_codeOutputs: DPVar[];

	get codeOutputs() {
		return this._codeOutputs || [];
	}

	get hasSelfEnableVars() {
		const enableVars = this.enableVars;
		if (this._codeOutputs.length > 0) {
			return [...enableVars, { id: this.id, node: this, vars: this._codeOutputs }];
		} else {
			return enableVars;
		}
	}

	init(data: CodeNodeInnerData) {
		if (!data.code) {
			data.code = `\n// ${t('workflow:code.codeComment')}\nfunction main() {\n\n  // ${t('workflow:code.outputComment')}\n  return {\n    output1: '${t(
				'workflow:code.output1'
			)}',\n    output2: '${t('workflow:code.output2')}'\n  }\n}\n`;
			data.codeOutputs = [
				{ key: 'output1', type: DPVarType.String },
				{ key: 'output2', type: DPVarType.String }
			];
		}
		data.codeOutputs.forEach((v) => {
			!this._codeOutputs && (this._codeOutputs = []);
			this._codeOutputs.push(new DPVar(v, this));
		});
		console.log(this._codeOutputs);
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

		// 更新 codeOutputs
		if (returnKeys.length > 0) {
			this.data.codeOutputs = returnKeys;
			this._codeOutputs.forEach((co) => {
				const index = this.vars.findIndex((v) => v.key === co.key);
				this.vars.splice(index, 1);
			});
			this._codeOutputs = returnKeys.map(({ key, type }) => new DPVar({ key, type }, this));
		}
	}

	get runSingleNeedAssignVars(): DPVar[] {
		const needAssignVars: DPVar[] = super.runSingleNeedAssignVars;
		const flatEnableVars = toFlatEnableVars(this.enableVars);
		// 使用正则找出this.code所有flatEnableVars中varFullkey相等的变量名
		const reg = new RegExp(`\\b(${flatEnableVars.map((v) => v.varFullkey).join('|')})\\b`, 'g');
		const matchs = this.code.match(reg);
		if (matchs) {
			matchs.forEach((v) => {
				const findit = flatEnableVars.find((fv) => fv.varFullkey === v);
				findit && needAssignVars.push(findit.value);
			});
		}
		return needAssignVars;
	}

	async runSelf(): Promise<void> {
		try {
			// 执行代码 获取返回值 ，保证先运行入口方法main
			const context = await this.getContext();
			const res = await this.runCode(this.code, context);
			// 更新变量值
			this._codeOutputs.forEach((v) => {
				v.value = res[v.key];
			});
			const outContext = { ...context, ...toContext([{ id: this.id, node: this, vars: this._codeOutputs }]) };
			this.outputs.forEach((v) => {
				v.value = this.runExpression(v.expression, outContext);
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
