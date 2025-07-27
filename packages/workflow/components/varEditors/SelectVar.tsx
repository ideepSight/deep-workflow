import { observer } from 'mobx-react-lite';
import React, { useMemo } from 'react';
import { Empty, Select, Space, Tooltip } from '@arco-design/web-react';
import type { DPBaseNode, DPVar, EnableVar } from '../../../workflow';
import { DPVarType, toFlatEnableVars } from '../../../workflow';
import { Icon } from '@deep-sight/dp-iconfont';
import { useI18n } from '../../i18n';

export type SelectVarProps = {
	enableVars: EnableVar[];
	value?: DPVar | string | null; // 支持传 expression
	onChange?: (varItem: DPVar | null) => void;
	size?: 'small' | 'default';
	style?: React.CSSProperties;
	filterType?: DPVarType[];
	empty?: string;
};

export const SelectVar: React.FC<SelectVarProps> = observer((props) => {
	const { enableVars, value, onChange, size, style, filterType, empty } = props;
	const { t } = useI18n();
	const handleChange = (key: string, node: DPBaseNode) => {
		const varItem = node?.vars.find((v) => v.key === key);
		onChange(varItem);
	};
	const filterEnableVars = useMemo(() => {
		if (!filterType?.length) return enableVars;
		const _enableVars = enableVars.filter(({ vars }) => {
			return vars.some((v) => filterType.includes(v.type));
		});
		const res = _enableVars.map(({ id, node, vars }) => {
			const _vars = vars.filter((v) => filterType.includes(v.type));
			return { id, node, vars: _vars };
		});
		return res;
	}, [enableVars, filterType]);

	const valueVar = useMemo(() => {
		if (!value) return null;
		if (typeof value === 'string') {
			const flatEnableVars = toFlatEnableVars(enableVars);
			const varItem = flatEnableVars.find((v) => v.varFullkey === value)?.value;
			if (!varItem) {
				onChange(null); // 没有找到变量，清除原有值
			}
			return varItem;
		}
		return value;
	}, [enableVars, value]);
	return (
		<Select
			size={size}
			className="select-var-wrap"
			prefix={<Icon name="huanjingbianliang" className="select-var-prefix" />}
			dropdownMenuClassName={'select-var'}
			getPopupContainer={() => document.querySelector('.workflow-wrap')}
			allowClear
			notFoundContent={<Empty description={enableVars.length ? empty : t('workflow:selectVar.connectVarNode')} />}
			defaultValue={valueVar?.key}
			placeholder={t('workflow:selectVar.selectVar')}
			style={{ minWidth: 160, ...style }}
			onChange={(key, option) => handleChange(key, Array.isArray(option) ? option.map((o) => o.extra)[0] : option?.extra)}
			renderFormat={(option, value) => {
				if (option) {
					const dpNode = option?.extra;
					return (
						<Tooltip
							getPopupContainer={() => document.querySelector('.workflow-wrap')}
							content={
								<Space className="var-item-home" size={4}>
									<Space size={2}>
										{dpNode.nodeConfig.icon && dpNode.nodeConfig.icon({})}
										{dpNode.title}
									</Space>
									<b>/</b>
									<div className="var-item">
										<Space size={4}>
											<Icon className="var-fx" name="huanjingbianliang" />
											{option.value}
										</Space>
									</div>
								</Space>
							}
						>
							<Space className="var-item-home" size={4}>
								<Space size={2}>
									{dpNode.nodeConfig.icon && dpNode.nodeConfig.icon({})}
									{dpNode.title}
								</Space>
								<b>/</b>
								<div className="var-item">
									<Space size={4}>
										<Icon className="var-fx" name="huanjingbianliang" />
										{option.value}
									</Space>
								</div>
							</Space>
						</Tooltip>
					);
				}
				return <>{value}</>;
			}}
		>
			{filterEnableVars.map(({ id, node, vars }) => {
				if (!vars.length) return null;
				return (
					<Select.OptGroup key={id} label={node.title}>
						{vars.map((varItem) => {
							const disabled = filterType?.length && !filterType.includes(varItem.type);
							return (
								<Select.Option key={varItem.key} value={varItem.key} extra={node} disabled={disabled}>
									<Space className="option-inner">
										<div className="var-item">
											<Space size={4}>
												<Icon className="var-fx" name="huanjingbianliang" />
												{varItem.key}
											</Space>
										</div>
										<div className="desc">{varItem.type}</div>
									</Space>
								</Select.Option>
							);
						})}
					</Select.OptGroup>
				);
			})}
		</Select>
	);
});
