import { Input, Select, Space } from '@arco-design/web-react';
import React, { useEffect, useState } from 'react';
import { DPVarType } from '../../lib';
import { Icon } from '../../../workflow/components/Icon';
import { getDPVarTypeOptions } from '../../utils';

type ValueType = { key?: string; type?: DPVarType };
export const InputVar: React.FC<{
	value: ValueType;
	readonlyKey?: boolean;
	disabled?: boolean;
	onChange: (value: ValueType) => void;
}> = ({ value, onChange, readonlyKey, disabled }) => {
	const [localValue, setLocalValue] = useState<ValueType>(value);

	const handleChange = (v: ValueType) => {
		setLocalValue(v);
		onChange && onChange(v);
	};
	return (
		<div className="var-item input-item">
			<Space size={4}>
				<Input
					prefix={<Icon className="var-fx" name="huanjingbianliang" />}
					size="small"
					disabled={disabled}
					readOnly={readonlyKey}
					defaultValue={localValue.key}
					onChange={(v) => {
						handleChange({ ...localValue, key: v });
					}}
				/>
			</Space>
			<Space className="var-type" size={2}>
				<Select
					size="small"
					disabled={disabled}
					value={localValue.type}
					onChange={(v) => {
						handleChange({ ...localValue, type: v });
					}}
					options={getDPVarTypeOptions()}
				></Select>
			</Space>
		</div>
	);
};
