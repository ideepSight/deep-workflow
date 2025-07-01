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
				JSON.parse(v);
				setErrorMsg('');
				onChange && onChange(v);
			} catch (error) {
				setErrorMsg(t('workflow:codeEditor.jsonError') || 'JSON 格式错误');
			}
		},
		[onChange, t]
	);

	return (
		<div className="code-editor">
			<div className="arco-mentions arco-mentions-align-textarea expression-input">
				<div className={`${errMsg ? 'arco-input-error' : ''} arco-input  arco-input-size-default`}>
					<p>JSON</p>
					<div className="arco-select-view">
						<div className="arco-select-inner">
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
