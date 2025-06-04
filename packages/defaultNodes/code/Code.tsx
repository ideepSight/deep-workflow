import { observer } from 'mobx-react-lite';
import React, { useState, useCallback, Fragment } from 'react';
import { Button, Empty, Tooltip } from '@arco-design/web-react';
import { Handle, Position } from '@xyflow/react';
import { CodeEditor, DefineVar, NodeComponentProps } from '../../workflow';
import { CodeNode } from '.';
import _ from 'lodash';
import { IconDelete, IconInfoCircleFill, IconPlus } from '@arco-design/web-react/icon';
import { Icon } from '@deep-sight/dp-iconfont';
import { InputVar } from '../../workflow/components/varEditors/InputVar';
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
				<div className="out-var-list">
					{node.codeOutputs.map((outVar) => {
						return (
							<Fragment key={outVar.key}>
								<Tooltip content={t('workflow:code.outputReadonlyTip')} position="left">
									<div>
										<InputVar
											value={{ key: outVar.key, type: outVar.type }}
											readonlyKey
											onChange={(v) => {
												outVar.key = v.key;
												outVar.type = v.type;
											}}
										/>
									</div>
								</Tooltip>
							</Fragment>
						);
					})}
					{node.outputs.map((outVar, index) => {
						return (
							<div key={outVar.key} className="var-item-wrap">
								<DefineVar
									enableVars={node.hasSelfEnableVars}
									value={outVar.data}
									rule={{
										validator: (_, value, cb) => {
											if (!value) {
												cb('不能为空');
											}
											if ([...node.codeOutputs, ...node.outputs].find((v, i) => i !== index && v.key === value)) {
												cb('名称不能重复');
											}
											return true;
										}
									}}
									onChange={(v) => {
										outVar.key = v.key;
										outVar.type = v.type;
										outVar.expression = v.expression;
									}}
								/>
								<Button
									type="secondary"
									className="del-btn"
									size="mini"
									status="danger"
									shape="circle"
									icon={<IconDelete />}
									onClick={() => node.removeOutput(index)}
								/>
							</div>
						);
					})}
					{!node.outputs.length && !node.codeOutputs.length ? (
						<Empty
							description={
								<Button onClick={() => node.addOutput()} icon={<IconPlus className="btn-gray-icon" />}>
									添加变量
								</Button>
							}
						/>
					) : (
						<Button style={{ marginTop: 10 }} onClick={() => node.addOutput()} icon={<IconPlus className="btn-gray-icon" />}>
							添加变量
						</Button>
					)}
				</div>
			</div>
		</div>
	);
});
