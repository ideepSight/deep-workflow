// 下拉选择或者变量选择

import React, { useMemo, useState } from 'react';
import { Button, Select, Tooltip } from '@arco-design/web-react';
import { SelectVar, SelectVarProps, DPVar, t, toFlatEnableVars } from '../../../workflow';
import { Icon } from '@deep-sight/dp-iconfont';

export type SelectOptionVarValue = {
	mode: 'var' | 'option';
	innerValue?: DPVar | string | null; // 支持传 expression
	optionValue?: string | null;
};

type SelectOptionVarProps = Omit<SelectVarProps, 'value' | 'onChange'> & {
	value?: SelectOptionVarValue;
	onChange?: (value: SelectOptionVarValue) => void;
	options: { label: string; value: string }[];
	notFoundContent?: React.ReactNode;
};

export const SelectOptionVar: React.FC<SelectOptionVarProps> = (props) => {
	const { enableVars, value, onChange, size = 'default', style, filterType, empty, options, notFoundContent } = props;
	const [mode, setMode] = useState<'var' | 'option'>(value.mode || 'option');
	const [varValue, setVarValue] = useState<DPVar | string | null>(value?.innerValue);
	const [optionValue, setOptionValue] = useState<string | null>(value?.optionValue);

	const handleChangeVar = (varItem: DPVar | null) => {
		setVarValue(varItem);
		onChange?.({ ...value, innerValue: varItem.fullKey });
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
					getPopupContainer={(node) => node?.parentElement}
					notFoundContent={notFoundContent}
					options={options}
					allowClear
					placeholder={t('workflow:runInputModal.select')}
				/>
			)}
			<Tooltip content={mode === 'var' ? t('workflow:enableVars.selectOption') : t('workflow:enableVars.selectVar')}>
				<Button
					size="mini"
					type="text"
					className="change-mode"
					onClick={() => {
						const newMode = mode === 'var' ? 'option' : 'var';
						setMode(newMode);
						onChange?.({ ...value, mode: newMode });
					}}
					icon={<Icon name="duoxunhuan" />}
				/>
			</Tooltip>
		</div>
	);
};
