import { observer } from 'mobx-react-lite';
import React from 'react';
import { Button, Tooltip } from '@arco-design/web-react';
import { IconCloudDownload, IconDelete, IconInfoCircleFill, IconPlus } from '@arco-design/web-react/icon';
import { Handle, Position } from '@xyflow/react';
import { UrlDownloadNode } from '.';
import { DefineVar, NodeComponentProps, SelectInputVar, SelectInputVarValue, TextEditor } from '@deep-sight/workflow';
import { InputVar } from '@deep-sight/workflow';

export const UrlDownloadIcon = () => {
	return <IconCloudDownload />;
};

export const UrlDownload: React.FC<NodeComponentProps<UrlDownloadNode>> = observer(({ node }) => {
	return (
		<div>
			<Handle id={`${node.id}-target`} type="target" className="base-handle" position={Position.Left} />
			<Handle id={`${node.id}-source`} type="source" className="base-handle" position={Position.Right} />
		</div>
	);
});

export const UrlDownloadSet: React.FC<NodeComponentProps<UrlDownloadNode>> = observer(({ node }) => {
	const enableVars = node.enableVars.reverse();
	const handleChangeUrl = (config: SelectInputVarValue) => {
		node.data.urlConfig = config;
	};
	const handleChangeDownloadDir = (config: SelectInputVarValue) => {
		node.data.downloadDir = config;
	};

	return (
		<div className="custom-node-set-wrap code-node">
			<div className="input-var-wrap">
				<b className="handle-name">下载链接</b>
				<SelectInputVar enableVars={enableVars} value={node.data.urlConfig} onChange={handleChangeUrl} />
			</div>
			<br />
			<div className="input-var-wrap">
				<b className="handle-name">下载链接请求头</b>
				<TextEditor enableVars={enableVars} value={node.data.header} onChange={(v) => (node.data.header = v)} />
			</div>
			<br />
			<div className="input-var-wrap">
				<b className="handle-name">下载至文件夹</b>
				<SelectInputVar enableVars={enableVars} value={node.data.downloadDir} onChange={handleChangeDownloadDir} />
			</div>
			<br />
			<div className="output-var-wrap">
				<br />
				<br />
				<b className="handle-name">输出变量</b>
				<br />
				<div className="out-var-list">
					{node.downloadFilePathVar && (
						<Tooltip content="下载文件路径变量节点自带，不可修改" position="left">
							<div>
								<InputVar
									value={{ key: node.downloadFilePathVar.key, type: node.downloadFilePathVar.type }}
									readonlyKey
									readonlyType
									onChange={(v) => {
										node.downloadFilePathVar.key = v.key;
										node.downloadFilePathVar.type = v.type;
									}}
								/>
							</div>
						</Tooltip>
					)}
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
											if (
												node.outputs.find((v, i) => i !== index && v.key === value) ||
												node.downloadFilePathVar.key === value
											) {
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
									onClick={() => node.removeOutput(outVar)}
								/>
							</div>
						);
					})}
					<Button style={{ marginTop: 10 }} onClick={() => node.addOutput()} icon={<IconPlus className="btn-gray-icon" />}>
						添加变量
					</Button>
				</div>
			</div>
		</div>
	);
});
