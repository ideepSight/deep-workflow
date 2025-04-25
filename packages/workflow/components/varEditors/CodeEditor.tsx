import React, { useState, useCallback, useEffect } from 'react';
import type { EnableVar } from '../../../workflow';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { autocompletion, CompletionContext } from '@codemirror/autocomplete';
import { validateCode } from './lib/validate';

interface CodeEditorProps {
	enableVars: EnableVar[];
	value?: string;
	onChange?: (expression: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ enableVars, value = '', onChange }) => {
	const [expression, setExpression] = useState(value);
	const [errMsg, setErrorMsg] = useState('');

	const handleInputChange = useCallback(
		(v: string) => {
			setExpression(v);
			try {
				validateCode(v, enableVars);
				setErrorMsg('');
				onChange(v);
			} catch (error) {
				setErrorMsg(typeof error === 'string' ? error : '代码错误');
			}
		},
		[onChange, enableVars]
	);

	const getCompletions = useCallback(
		(context: CompletionContext) => {
			// 获取当前光标位置之前的文本
			const textBefore = context.state.doc.sliceString(0, context.pos);

			// 检查是否在字符串中
			const inString = /["'].*$/.test(textBefore);
			if (inString) return null;

			// 检查是否在对象属性访问位置（对象名.）
			const dotMatch = textBefore.match(/[a-zA-Z_\u4e00-\u9fa5$][a-zA-Z0-9_\u4e00-\u9fa5$]*\.$/);
			if (dotMatch) {
				const objectName = dotMatch[0].slice(0, -1); // 去掉最后的点
				const parent = enableVars.find((v) => v.node.title === objectName);
				if (parent) {
					return {
						from: context.pos,
						options: parent.vars.map((varItem) => ({
							label: varItem.key,
							type: 'variable',
							detail: '',
							apply: varItem.key // 直接应用变量名
						}))
					};
				}
				return null;
			}

			// 检查是否在变量名位置
			const match = textBefore.match(/^[a-zA-Z_\u4e00-\u9fa5$][a-zA-Z0-9_\u4e00-\u9fa5$]*$/);
			if (!match) return null;

			const prefix = match[0];
			return {
				from: context.pos - prefix.length,
				options: enableVars.flatMap(({ node, vars }) =>
					vars.map((varItem) => ({
						label: varItem.key,
						type: 'variable',
						detail: `${node.title}.${varItem.key}`,
						apply: `${node.title}.${varItem.key}` // 自动补全对象名
					}))
				)
			};
		},
		[enableVars]
	);

	const getVarParentCompletions = useCallback(
		(context: CompletionContext) => {
			const textBefore = context.state.doc.sliceString(0, context.pos);
			const match = textBefore.match(/^[a-zA-Z_\u4e00-\u9fa5$][a-zA-Z0-9_\u4e00-\u9fa5$]*$/);
			if (!match) return null;
			const prefix = match[0];
			return {
				from: context.pos - prefix.length,
				options: enableVars.map(({ node }) => ({
					label: node.title,
					type: 'variable',
					detail: '',
					apply: node.title // 直接应用对象名
				}))
			};
		},
		[enableVars]
	);

	return (
		<div className="code-editor">
			<div className="arco-mentions arco-mentions-align-textarea expression-input">
				<div className={`${errMsg ? 'arco-input-error' : ''} arco-input  arco-input-size-default`}>
					<p>JavaScript</p>
					<div className="arco-select-view">
						<div className="arco-select-inner">
							<span className="arco-select-view-selector">
								<CodeMirror
									value={expression}
									extensions={[
										javascript(),
										autocompletion({
											override: [getVarParentCompletions, getCompletions]
										})
									]}
									onChange={handleInputChange}
									className="dp-auto-complete"
								/>
							</span>
						</div>
					</div>
				</div>
				{errMsg && <div className="error-msg">{errMsg}</div>}
			</div>
		</div>
	);
};
