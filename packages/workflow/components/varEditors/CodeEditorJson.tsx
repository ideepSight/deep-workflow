import React, { useState, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json as jsonLang } from '@codemirror/lang-json';
import { useI18n } from '../../i18n';

interface CodeEditorProps {
	value?: string;
	onChange?: (expression: string) => void;
}

export const CodeEditorJson: React.FC<CodeEditorProps> = ({ value = '', onChange }) => {
	const [expression, setExpression] = useState(value);
	const [errMsg, setErrorMsg] = useState('');
	const { t } = useI18n();

	const handleInputChange = useCallback(
		(v: string) => {
			setExpression(v);
			try {
				const parsedJson = JSON.parse(v);

				// 检查JSON中的所有键是否包含反斜杠
				const checkKeys = (obj: any): boolean => {
					if (typeof obj !== 'object' || obj === null) return true;
					if (Array.isArray(obj)) return obj.every(checkKeys);
					return Object.keys(obj).every((key) => {
						if (key.includes('\/')) {
							throw new Error(`${t('workflow:codeEditor.jsonErrorKey')} ${key}`);
						}
						return checkKeys(obj[key]);
					});
				};

				checkKeys(parsedJson);
				setErrorMsg('');
				onChange && onChange(v);
			} catch (error) {
				setErrorMsg(error instanceof Error ? error.message : t('workflow:codeEditor.jsonError'));
			}
		},
		[onChange, t]
	);

	return (
		<div className="code-editor">
			<div className="arco-mentions arco-mentions-align-textarea expression-input">
				<div className={`${errMsg ? 'arco-input-error' : ''} arco-input  arco-input-size-default`}>
					<p style={{ margin: 0 }}>JSON</p>
					<div className="arco-select-view">
						<div className="arco-select-inner" style={{ width: '100%' }}>
							<span className="arco-select-view-selector">
								<CodeMirror
									minHeight="150px"
									value={expression}
									extensions={[jsonLang()]}
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
