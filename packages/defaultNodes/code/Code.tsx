import { observer } from 'mobx-react-lite';
import React, { useState, useCallback, Fragment } from 'react';
import { Empty, Tooltip } from '@arco-design/web-react';
import { Handle, Position } from '@xyflow/react';
import { CodeEditor, NodeComponentProps } from '../../workflow';
import { CodeNode } from '.';
import _ from 'lodash';
import { IconInfoCircleFill } from '@arco-design/web-react/icon';
import { Icon } from '../../workflow/components/Icon';
import { InputVar } from './InputVar';
import { useI18n } from '../../workflow/i18n';

export const CodeIcon = () => {
	return <Icon name="code" />;
};

export const Code: React.FC<NodeComponentProps<CodeNode>> = observer(({ node }) => {
	return (
		<div>
			<Handle id={`${node.id}-target`} type="target" className="base-handle" position={Position.Left} />
			<Handle id={`${node.id}-source`} type="source" className="base-handle" position={Position.Right} />
		</div>
	);
});

export const CodeSet: React.FC<NodeComponentProps<CodeNode>> = observer(({ node }) => {
	const { t } = useI18n();
	const enableVars = node.enableVars.reverse();
	const [code, setCode] = useState(node.code);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedUpdateCode = useCallback(
		_.debounce((newCode: string) => {
			node.setCodeOutputVars(newCode);
		}, 1000),
		[node]
	);

	const handleChange = (newCode: string) => {
		setCode(newCode);
		node.code = newCode;
		debouncedUpdateCode(newCode);
	};

	return (
		<div className="custom-node-set-wrap code-node">
			<CodeEditor enableVars={enableVars} value={code} onChange={handleChange} />
			<div className="output-var-wrap">
				<br />
				<br />
				<b className="handle-name">{t('workflow:code.outputVar')}</b>
				<Tooltip content={t('workflow:code.outputTip')}>
					<IconInfoCircleFill className="info-icon" />
				</Tooltip>
				<br />
				<div className="var-list">
					{node.outputs.map((outVar) => {
						return (
							<Fragment key={outVar.key}>
								<InputVar
									value={{ key: outVar.key, type: outVar.type }}
									readonlyKey
									onChange={(v) => {
										outVar.key = v.key;
										outVar.type = v.type;
									}}
								/>
							</Fragment>
						);
					})}
					{node.outputs.length === 0 && <Empty description={t('workflow:code.noOutput')} />}
				</div>
			</div>
		</div>
	);
});
