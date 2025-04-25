import { Input, Select, Space } from '@arco-design/web-react';
import React, { useEffect, useState } from 'react';
import { DPVarType, EnableVar } from '../../lib';
import { Icon } from '../../../workflow/components/Icon';
import { getDPVarTypeOptions } from '../../utils';
import { SelectVar } from './SelectVar';

type ValueType = { key?: string; type?: DPVarType };
export const InputVar: React.FC<{
	value: ValueType;
	readonlyKey?: boolean;
	disabled?: boolean;
	onChange: (value: ValueType) => void;
	enableVars?: EnableVar[];
}> = ({ value, onChange, readonlyKey, disabled, enableVars }) => {
	const [localValue, setLocalValue] = useState<ValueType>(value);

	const handleChange = (v: ValueType) => {
		setLocalValue(v);
		onChange && onChange(v);
	};
	return (
		<div className="var-item-block input-item">
			<Space size={4}>
				<Input
					prefix={<Icon className="var-fx" name="huanjingbianliang" />}
					size="small"
					disabled={disabled}
					style={{ width: 80 }}
					readOnly={readonlyKey}
					defaultValue={localValue.key}
					onChange={(v) => {
						handleChange({ ...localValue, key: v });
					}}
				/>
			</Space>
			<Space className="var-type" size={2}>
				{enableVars ? (
					<SelectVar enableVars={enableVars} style={{ flex: 1 }} size='small' />
				) : (
					<Select
						size="small"
						style={{ flex: 1 }}
						disabled={disabled}
						value={localValue.type}
						onChange={(v) => {
							handleChange({ ...localValue, type: v });
						}}
						options={getDPVarTypeOptions()}
					/>
				)}
			</Space>
		</div>
	);
};
