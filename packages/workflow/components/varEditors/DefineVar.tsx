import { Input, Select, Space } from '@arco-design/web-react';
import React, { useState } from 'react';
import { DPVar, DPVarType, EnableVar } from '../../lib';
import { Icon } from '@deep-sight/dp-iconfont';
import { SelectVar } from './SelectVar';
import { t } from '../../i18n';
import { DPRuleItem, DPValidator } from '../../validator';

type ValueType = { key?: string; type?: DPVarType; expression?: string };
export const DefineVar: React.FC<{
	value: ValueType;
	empty?: string;
	rule?: DPRuleItem;
	disabled?: boolean;
	onChange: (value: ValueType) => void;
	enableVars?: EnableVar[];
}> = ({ value, onChange, disabled, enableVars, empty, rule }) => {
	const [localValue, setLocalValue] = useState<ValueType>(value);
	const [errorMsg, setErrorMsg] = useState<string>('');

	const handleSelectVar = (varItem: DPVar | null) => {
		const res = { ...localValue, type: varItem?.type, expression: varItem?.fullKey };
		setLocalValue(res);
		onChange && onChange(res);
	};

	const handleChangeInput = async (res: ValueType) => {
		let emsg = '';
		const validator = new DPValidator([rule]);
		try {
			await validator.validate(res.key);
			onChange && onChange(res);
		} catch (error) {
			emsg = error?.errors[0].message;
		} finally {
			setErrorMsg(emsg);
		}
	};

	return (
		<div className="var-item-block input-item">
			<div style={{ display: 'flex', gap: 4, justifyContent: 'space-between', width: '100%' }}>
				<Input
					prefix={<Icon className="var-fx" name="huanjingbianliang" />}
					size="small"
					disabled={disabled}
					style={{ width: 120 }}
					status={errorMsg ? 'error' : null}
					defaultValue={localValue.key}
					onChange={(key) => {
						const res = { ...localValue, key }
						setLocalValue(res);
						handleChangeInput(res)
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
			{errorMsg && <div className="input-err-msg">{errorMsg}</div>}
		</div>
	);
};
