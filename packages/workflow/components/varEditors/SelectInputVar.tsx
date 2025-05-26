// 自由输入或者变量选择
import React, { useState } from 'react';
import { Button, Input, Tooltip } from '@arco-design/web-react';
import { SelectVar, SelectVarProps, DPVar, t } from '../../../workflow';
import { Icon } from '@deep-sight/dp-iconfont';

export type SelectInputVarValue = {
	mode: 'var' | 'option';
	innerValue?: DPVar | string | null; // 支持传 expression
	inputValue?: string | null;
};

type SelectInputVarProps = Omit<SelectVarProps, 'value' | 'onChange'> & {
	value?: SelectInputVarValue;
	onChange?: (value: SelectInputVarValue) => void;
};

export const SelectInputVar: React.FC<SelectInputVarProps> = (props) => {
	const { enableVars, value, onChange, size = 'default', style, filterType, empty } = props;
	const [mode, setMode] = useState<'var' | 'option'>(value?.mode || 'option');
	const [varValue, setVarValue] = useState<DPVar | string | null>(value?.innerValue);
	const [inputValue, setInputValue] = useState<string | null>(value?.inputValue);

	const handleChangeVar = (varItem: DPVar | null) => {
		setVarValue(varItem);
		onChange?.({ ...value, innerValue: varItem });
		setInputValue(null);
	};

	const handleChangeInput = (v: string | null) => {
		setInputValue(v);
		onChange?.({ ...value, inputValue: v });
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
				<Input
					size={size}
					style={style}
					value={inputValue}
					onChange={handleChangeInput}
					allowClear
					placeholder={t('workflow:simpleExpression.input')}
				/>
			)}
			<Tooltip content={mode === 'var' ? t('workflow:enableVars.selectInput') : t('workflow:enableVars.selectVar')}>
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
