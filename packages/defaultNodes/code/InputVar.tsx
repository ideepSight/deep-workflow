import { Input, Select, Space } from '@arco-design/web-react';
import React, { useState } from 'react';
import { DPVarType } from '../../workflow/lib';
import { Icon } from '@deep-sight/dp-iconfont';
import { getDPVarTypeOptions } from '../../workflow/utils';

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
		<div className="var-item-block input-item" style={{ display: 'flex', gap: 4, justifyContent: 'space-between', width: '100%' }}>
			<Space size={4}>
				<Input
					prefix={<Icon className="var-fx" name="huanjingbianliang" />}
					size="small"
					disabled={disabled}
					style={{ width: 200 }}
					readOnly={readonlyKey}
					defaultValue={localValue.key}
				/>
			</Space>
			<Space className="var-type" size={2}>
				<Select
					size="small"
					style={{ flex: 1, width: 130 }}
					disabled={disabled}
					value={localValue.type}
					onChange={(v) => {
						handleChange({ ...localValue, type: v });
					}}
					options={getDPVarTypeOptions()}
				/>
			</Space>
		</div>
	);
};
