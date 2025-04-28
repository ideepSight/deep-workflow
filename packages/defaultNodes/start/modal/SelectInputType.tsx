import classNames from 'classnames';
import React, { memo, useCallback, useEffect, useState } from 'react';
import InputVarTypeIcon from './InputTypeIcon';
import style from './InputAddModal.module.less';
import { FormItemType } from '../../../workflow';

export const SelectInputType: React.FC<{ value?: FormItemType; onChange?: (v: FormItemType) => void }> = memo(({ value, onChange }) => {
	const [type, setType] = useState<FormItemType>(FormItemType.textInput);

	const handleChange = useCallback(
		(type: FormItemType) => {
			setType(type);
			onChange && onChange(type);
		},
		[onChange]
	);

	useEffect(() => {
		if (value) {
			setType(value);
			onChange && onChange(value);
		} else {
			onChange && onChange(FormItemType.textInput);
		}
	}, [onChange, value]);

	const inputTypes: FormItemType[] = [
		FormItemType.textInput,
		FormItemType.paragraph,
		FormItemType.select,
		FormItemType.number,
		FormItemType.singleFile,
		FormItemType.multiFiles
	];

	return (
		<div className={style['select-field-var-wrap']}>
			{inputTypes.map((inputType) => (
				<div key={inputType} className={classNames({ [style['selected']]: type === inputType }, style['item'])} onClick={() => handleChange(inputType)}>
					<InputVarTypeIcon type={inputType} className={style['var-item-icon']} />
					<span>{inputType}</span>
				</div>
			))}
		</div>
	);
});
