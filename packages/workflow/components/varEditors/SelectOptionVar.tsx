// 下拉选择或者变量选择

import React, { useState } from 'react';
import { Button, Select, Tooltip } from '@arco-design/web-react';
import { SelectVar, SelectVarProps, DPVar, t } from '../../../workflow';
import { Icon } from '@deep-sight/dp-iconfont';

type SelectOptionVarValue = {
	mode: 'var' | 'option';
	varValue?: DPVar | null;
	optionValue?: string | null;
};

type SelectOptionVarProps = Omit<SelectVarProps, 'value' | 'onChange'> & {
	value?: SelectOptionVarValue;
	onChange?: (value: SelectOptionVarValue) => void;
	options: { label: string; value: string }[];
};

export const SelectOptionVar: React.FC<SelectOptionVarProps> = (props) => {
	const { enableVars, value, onChange, size = 'default', style, filterType, empty, options } = props;
	const [mode, setMode] = useState<'var' | 'option'>(value.mode || 'option');
	const [varValue, setVarValue] = useState<DPVar | null>(value?.varValue);
	const [optionValue, setOptionValue] = useState<string | null>(value?.optionValue);

	const handleChangeVar = (varItem: DPVar | null) => {
		setVarValue(varItem);
		onChange?.({ ...value, varValue: varItem });
		setOptionValue(null);
	};

	const handleChangeOption = (optionItem: string | null) => {
		setOptionValue(optionItem);
		onChange?.({ ...value, optionValue: optionItem });
		setVarValue(null);
	};

	return (
		<div className="select-option-var">
			{mode === 'var' ? (
				<SelectVar
					enableVars={enableVars}
					value={varValue}
					onChange={handleChangeVar}
					size={size}
					style={style}
					filterType={filterType}
					empty={empty}
				/>
			) : (
				<Select
					size={size}
					style={style}
					value={optionValue}
					onChange={handleChangeOption}
					options={options}
					allowClear
					placeholder={t('workflow:runInputModal.select')}
				/>
			)}
			<Tooltip content={mode === 'var' ? '切换选项选择' : '切换变量选择'}>
				<Button
					size="mini"
					type="text"
					className="change-mode"
					onClick={() => {
						setMode(mode === 'var' ? 'option' : 'var');
					}}
					icon={<Icon name="duoxunhuan" />}
				/>
			</Tooltip>
		</div>
	);
};
