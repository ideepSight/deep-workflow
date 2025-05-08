import { Input, Select, Space } from '@arco-design/web-react';
import React, { useState } from 'react';
import { DPVar, DPVarType, EnableVar } from '../../lib';
import { Icon } from '@deep-sight/dp-iconfont';
import { SelectVar } from './SelectVar';

type ValueType = { key?: string; type?: DPVarType; expression?: string };
export const DefineVar: React.FC<{
	value: ValueType;
	disabled?: boolean;
	onChange: (value: ValueType) => void;
	enableVars?: EnableVar[];
}> = ({ value, onChange, disabled, enableVars }) => {
	const [localValue, setLocalValue] = useState<ValueType>(value);

	const handleSelectVar = (varItem: DPVar | null) => {
		setLocalValue({ ...localValue, type: varItem.type, expression: varItem.fullKey });
	};

	return (
		<div className="var-item-block input-item">
			<Space size={4} style={{ justifyContent: 'space-between' }}>
				<Input
					prefix={<Icon className="var-fx" name="huanjingbianliang" />}
					size="small"
					disabled={disabled}
					style={{ width: 120 }}
					defaultValue={localValue.key}
					onChange={(key) => {
						setLocalValue({ ...localValue, key });
					}}
					onBlur={() => {
						onChange && onChange(localValue);
					}}
				/>
				<SelectVar enableVars={enableVars} style={{ flex: 1 }} size="small" onChange={handleSelectVar} />
			</Space>
		</div>
	);
};
