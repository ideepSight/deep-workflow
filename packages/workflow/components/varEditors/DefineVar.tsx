import { Input, Select, Space } from '@arco-design/web-react';
import React, { useState } from 'react';
import { DPVar, DPVarType, EnableVar } from '../../lib';
import { Icon } from '@deep-sight/dp-iconfont';
import { SelectVar } from './SelectVar';
import { t } from '../../i18n';

type ValueType = { key?: string; type?: DPVarType; expression?: string };
export const DefineVar: React.FC<{
	value: ValueType;
	empty?: string;
	disabled?: boolean;
	onChange: (value: ValueType) => void;
	enableVars?: EnableVar[];
}> = ({ value, onChange, disabled, enableVars, empty }) => {
	const [localValue, setLocalValue] = useState<ValueType>(value);

	const handleSelectVar = (varItem: DPVar | null) => {
		const res = { ...localValue, type: varItem?.type, expression: varItem?.fullKey };
		setLocalValue(res);
		onChange && onChange(res);
	};

	return (
		<div className="var-item-block input-item">
			<div style={{ display: 'flex', gap: 4, justifyContent: 'space-between', width: '100%' }}>
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
				<SelectVar
					empty={empty || t('workflow:vars.connectVarNode')}
					enableVars={enableVars}
					style={{ flex: 1 }}
					size="small"
					value={localValue.expression}
					onChange={handleSelectVar}
				/>
			</div>
		</div>
	);
};
