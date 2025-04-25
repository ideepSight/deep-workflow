import { observer } from 'mobx-react-lite';
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Button, Descriptions, Empty, Space, Tag, Tooltip } from '@arco-design/web-react';
import { InputAddModal } from './modal/InputAddModal';
import './index.less';
import { Icon } from '../../workflow/components/Icon';
import { IconDelete, IconEdit, IconPlus } from '@arco-design/web-react/icon';
import { DPStartNode, InputVarData } from '.';
import { NodeComponentProps } from '../../workflow';

export const StartIcon = () => {
	return <Icon name="huojian" />;
};

export const Start: React.FC<NodeComponentProps<DPStartNode>> = observer(({ node }) => {
	return (
		<div className="start-node-wrap">
			<Handle type="source" id="start" className="base-handle" position={Position.Right} />
			{!!node.inputs.length && (
				<div className="var-list">
					{node.inputs.map(({ input }) => {
						return (
							<div key={input.fieldName} className="var-item input-item">
								<Space size={4}>
									<Icon className="var-fx" name="huanjingbianliang" />
									<div>{input.fieldName}</div>
								</Space>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
});

export const StartSet: React.FC<NodeComponentProps<DPStartNode>> = observer(({ node }) => {
	const handleAdd = async () => {
		const res = await InputAddModal();
		if (res) {
			node.addInput(res);
		}
	};
	const handleEdit = async (item: InputVarData) => {
		const res = await InputAddModal(item);
		if (res) {
			node.updateInput(item, res);
		}
	};
	return (
		<div className="custom-node-set-wrap">
			<Space>
				<b>输入字段</b>
				<Tooltip content="添加字段">
					<Button type="default" shape="round" size="mini" onClick={handleAdd} icon={<IconPlus className="btn-gray-icon" />} />
				</Tooltip>
			</Space>
			<div className="out-var-list">
				{node.inputs.map(({ input }) => {
					return (
						<div key={input.fieldName} className="var-item-block input-item">
							<Space size={4}>
								<Icon className="var-fx" name="huanjingbianliang" />
								<Tooltip
									content={
										<Descriptions
											size="mini"
											layout="horizontal"
											column={1}
											data={[
												{
													label: '变量类型',
													value: <Tag>{input.varType}</Tag>
												},
												{
													label: '字段类型',
													value: <Tag>{input.fieldType}</Tag>
												},
												{
													label: '变量名称',
													value: <Tag>{input.fieldName}</Tag>
												},
												{
													label: '显示名称',
													value: <Tag>{input.label}</Tag>
												},
												{
													label: '默认值',
													value: input.defaultValue ? <Tag>{input.defaultValue}</Tag> : '无'
												},
												{
													label: '输入提示语',
													value: input.placeholder ? <Tag>{input.placeholder}</Tag> : '无'
												},
												{
													label: '是否必填',
													value: <Tag>{input.required ? '是' : '否'}</Tag>
												}
											]}
										/>
									}
								>
									<div>{input.fieldName}</div>
								</Tooltip>
							</Space>
							<Space className="btns" size={2}>
								<Button type="text" shape="round" size="mini" onClick={() => handleEdit(input)} icon={<IconEdit />} />
								<Button type="text" shape="round" status="danger" size="mini" onClick={() => node.removeInput(input)} icon={<IconDelete />} />
							</Space>
						</div>
					);
				})}
				{node.inputs.length === 0 ? (
					<Empty
						description={
							<Button onClick={handleAdd} icon={<IconPlus className="btn-gray-icon" />}>
								添加字段
							</Button>
						}
					/>
				) : (
					<Button style={{ marginTop: 10 }} onClick={handleAdd} icon={<IconPlus className="btn-gray-icon" />}>
						添加字段
					</Button>
				)}
			</div>
		</div>
	);
});
