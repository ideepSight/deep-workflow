import React, { useState, useCallback, useEffect } from 'react';
import type { EnableVar } from '../../../workflow';
import CodeMirror from '@uiw/react-codemirror';
import { python, pythonLanguage } from '@codemirror/lang-python';
import { autocompletion, CompletionContext, completeFromList } from '@codemirror/autocomplete';
import { validateCode } from './lib/validate';
import { useI18n } from '../../i18n';

interface CodeEditorProps {
	enableVars: EnableVar[];
	value?: string;
	onChange?: (expression: string) => void;
}

export const CodeEditorPy: React.FC<CodeEditorProps> = ({ enableVars, value = '', onChange }) => {
	const [expression, setExpression] = useState(value);
	const [errMsg, setErrorMsg] = useState('');
	const { t } = useI18n();

	const handleInputChange = useCallback(
		(v: string) => {
			setExpression(v);
			try {
				validateCode(v, enableVars);
				setErrorMsg('');
				onChange(v);
			} catch (error) {
				setErrorMsg(typeof error === 'string' ? error : t('workflow:codeEditor.error'));
			}
		},
		[onChange, enableVars, t]
	);

	// 合并自定义补全函数
	const customAutocomplete = useCallback(
		(context: CompletionContext) => {
			// 先尝试对象属性补全
			const textBefore = context.state.doc.sliceString(0, context.pos);
			const dotMatch = textBefore.match(/[a-zA-Z_\u4e00-\u9fa5$][a-zA-Z0-9_\u4e00-\u9fa5$]*\.$/);
			if (dotMatch) {
				const objectName = dotMatch[0].slice(0, -1);
				const parent = enableVars.find((v) => v.node.title === objectName);
				if (parent) {
					return {
						from: context.pos,
						options: parent.vars.map((varItem) => ({
							label: varItem.key,
							type: 'variable',
							detail: '',
							apply: varItem.key
						}))
					};
				}
				return null;
			}

			// 再尝试变量名补全
			const match = textBefore.match(/^[a-zA-Z_\u4e00-\u9fa5$][a-zA-Z0-9_\u4e00-\u9fa5$]*$/);
			if (match) {
				const prefix = match[0];
				return {
					from: context.pos - prefix.length,
					options: enableVars.flatMap(({ node, vars }) =>
						vars.map((varItem) => ({
							label: varItem.key,
							type: 'variable',
							detail: `${node.title}[${varItem.key}]`,
							apply: `${node.title}[${varItem.key}]`
						}))
					)
				};
			}

			// 再尝试父对象补全
			const parentMatch = textBefore.match(/^[a-zA-Z_\u4e00-\u9fa5$][a-zA-Z0-9_\u4e00-\u9fa5$]*$/);
			if (parentMatch) {
				const prefix = parentMatch[0];
				return {
					from: context.pos - prefix.length,
					options: enableVars.map(({ node }) => ({
						label: node.title,
						type: 'variable',
						detail: '',
						apply: node.title
					}))
				};
			}

			return null;
		},
		[enableVars]
	);

	return (
		<div className="code-editor">
			<div className="arco-mentions arco-mentions-align-textarea expression-input">
				<div className={`${errMsg ? 'arco-input-error' : ''} arco-input  arco-input-size-default`}>
					<p>Python</p>
					<div className="arco-select-view">
						<div className="arco-select-inner">
							<span className="arco-select-view-selector">
								<CodeMirror
									minHeight="150px"
									value={expression}
									extensions={[
										python(),
										pythonLanguage.data.of({
											autocomplete: customAutocomplete
										}),
										autocompletion()
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
