import { observer } from 'mobx-react-lite';
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Button, Descriptions, Empty, Space, Tag, Tooltip } from '@arco-design/web-react';
import './index.less';
import { Icon } from '@deep-sight/dp-iconfont';
import { IconDelete, IconEdit, IconPlus } from '@arco-design/web-react/icon';
import { StartNode } from '.';
import { DPVar, InputAddModal, NodeComponentProps } from '../../workflow';
import { useI18n } from '../../workflow/i18n';

export const StartIcon = () => {
	return <Icon name="huojian" />;
};

export const Start: React.FC<NodeComponentProps<StartNode>> = observer(({ node }) => {
	return (
		<div className="start-node-wrap">
			<Handle type="source" id="start" className="base-handle" position={Position.Right} />
			{!!node.inputFields.length && (
				<div className="var-list">
					{node.inputFields.map((input) => {
						return (
							<div key={input.key} className="var-item input-item">
								<Space size={4}>
									<Icon className="var-fx" name="huanjingbianliang" />
									<div>{input.name}</div>
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
		const res = await InputAddModal((value) => node.vars.some((v) => v.key === value));
		if (res) {
			node.addInputFields(res);
		}
	};
	const handleEdit = async (varItem: DPVar) => {
		const res = await InputAddModal((value) => node.vars.filter((v) => v.key !== varItem.key).some((v) => v.key === value), {
			fieldName: varItem.key,
			varType: varItem.type,
			...varItem.formInfo
		});
		if (res) {
			node.updateInputField(varItem, res);
		}
	};
	return (
		<div className="custom-node-set-wrap">
			<Space>
				<b>{t('workflow:start.inputField')}</b>
			</Space>
			<div className="out-var-list">
				{node.inputFields.map((input) => {
					const varItem = node.vars.find((item) => item.key === input.key);
					return (
						<div key={input.key} className="var-item-block input-item dfb">
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
													value: <Tag>{input.type}</Tag>
												},
												{
													label: t('workflow:start.fieldType'),
													value: <Tag>{t(`workflow:selectInputType.${input.formInfo.fieldType}`)}</Tag>
												},
												{
													label: t('workflow:start.varName'),
													value: <Tag>{input.key}</Tag>
												},
												{
													label: t('workflow:start.label'),
													value: <Tag>{input.name}</Tag>
												},
												{
													label: t('workflow:start.defaultValue'),
													value: input.formInfo.defaultValue ? <Tag>{input.formInfo.defaultValue}</Tag> : t('workflow:start.none')
												},
												{
													label: t('workflow:start.placeholder'),
													value: input.formInfo.placeholder ? <Tag>{input.formInfo.placeholder}</Tag> : t('workflow:start.none')
												},
												{
													label: t('workflow:start.required'),
													value: <Tag>{input.formInfo.required ? t('workflow:start.yes') : t('workflow:start.no')}</Tag>
												}
											]}
										/>
									}
								>
									<div>
										{input.key}
										<span className="var-type-color">{input.type}</span>
									</div>
								</Tooltip>
							</Space>
							<Space className="btns" size={2}>
								<Button type="text" shape="round" size="mini" onClick={() => handleEdit(varItem)} icon={<IconEdit />} />
								<Button
									type="text"
									shape="round"
									status="danger"
									size="mini"
									onClick={() => node.removeInputField(varItem)}
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
