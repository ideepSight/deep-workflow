import { observer } from 'mobx-react-lite';
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Button, Descriptions, Empty, Space, Tag, Tooltip } from '@arco-design/web-react';
import { InputAddModal } from './modal/InputAddModal';
import './index.less';
import { Icon } from '@deep-sight/dp-iconfont';
import { IconDelete, IconEdit, IconPlus } from '@arco-design/web-react/icon';
import { StartNode } from '.';
import { InputFieldData, NodeComponentProps } from '../../workflow';
import { useI18n } from '../../workflow/i18n';

export const StartIcon = () => {
	return <Icon name="huojian" />;
};

export const Start: React.FC<NodeComponentProps<StartNode>> = observer(({ node }) => {
	const { t } = useI18n();
	return (
		<div className="start-node-wrap">
			<Handle type="source" id="start" className="base-handle" position={Position.Right} />
			{!!node.inputFields.length && (
				<div className="var-list">
					{node.inputFields.map(({ input }) => {
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

export const StartSet: React.FC<NodeComponentProps<StartNode>> = observer(({ node }) => {
	const { t } = useI18n();
	const handleAdd = async () => {
		const res = await InputAddModal();
		if (res) {
			node.addInputFields(res);
		}
	};
	const handleEdit = async (item: InputFieldData) => {
		const res = await InputAddModal(item);
		if (res) {
			node.updateInput(item, res);
		}
	};
	return (
		<div className="custom-node-set-wrap">
			<Space>
				<b>{t('workflow:start.inputField')}</b>
			</Space>
			<div className="out-var-list">
				{node.inputFields.map(({ input }) => {
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
													label: t('workflow:start.varType'),
													value: <Tag>{input.varType}</Tag>
												},
												{
													label: t('workflow:start.fieldType'),
													value: <Tag>{input.fieldType}</Tag>
												},
												{
													label: t('workflow:start.varName'),
													value: <Tag>{input.fieldName}</Tag>
												},
												{
													label: t('workflow:start.label'),
													value: <Tag>{input.label}</Tag>
												},
												{
													label: t('workflow:start.defaultValue'),
													value: input.defaultValue ? <Tag>{input.defaultValue}</Tag> : t('workflow:start.none')
												},
												{
													label: t('workflow:start.placeholder'),
													value: input.placeholder ? <Tag>{input.placeholder}</Tag> : t('workflow:start.none')
												},
												{
													label: t('workflow:start.required'),
													value: <Tag>{input.required ? t('workflow:start.yes') : t('workflow:start.no')}</Tag>
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
								<Button
									type="text"
									shape="round"
									status="danger"
									size="mini"
									onClick={() => node.removeInputFields(input)}
									icon={<IconDelete />}
								/>
							</Space>
						</div>
					);
				})}
				{node.inputFields.length === 0 ? (
					<Empty
						description={
							<Button onClick={handleAdd} icon={<IconPlus className="btn-gray-icon" />}>
								{t('workflow:start.addField')}
							</Button>
						}
					/>
				) : (
					<Button style={{ marginTop: 10 }} onClick={handleAdd} icon={<IconPlus className="btn-gray-icon" />}>
						{t('workflow:start.addField')}
					</Button>
				)}
			</div>
		</div>
	);
});
