import React, { useState, useCallback } from 'react';
import type { EnableVar } from '../../../workflow';
import CodeMirror from '@uiw/react-codemirror';
import { autocompletion, CompletionContext } from '@codemirror/autocomplete';

interface TextEditorProps {
	enableVars: EnableVar[];
	value?: string;
	onChange?: (text: string) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({ enableVars, value = '', onChange }) => {
	const [text, setText] = useState(value);

	const handleInputChange = useCallback(
		(v: string) => {
			setText(v);
			onChange(v);
		},
		[onChange]
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
							detail: `${node.title}.${varItem.key}`,
							apply: `${node.title}.${varItem.key}`
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
				<div className={`arco-input  arco-input-size-default`}>
					<p>文本内容</p>
					<div className="arco-select-view">
						<div className="arco-select-inner">
							<span className="arco-select-view-selector">
								<CodeMirror
									minHeight="150px"
									value={text}
									extensions={[
										autocompletion({
											override: [customAutocomplete]
										})
									]}
									onChange={handleInputChange}
									className="dp-auto-complete"
								/>
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
