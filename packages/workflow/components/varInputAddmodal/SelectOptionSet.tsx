import React, { Fragment, useState } from 'react';
import style from './SelectOptionSet.module.less';
import { Button, Input } from '@arco-design/web-react';
import { uuid } from 'short-uuid';
import { IconDelete, IconPlus } from '@arco-design/web-react/icon';
import { useI18n } from '../../../workflow/i18n';

type Option = {
	id: string;
	label: string;
};

type SelectOptionSetProps = {
	value?: Option[];
	onChange?: (value: Option[]) => void;
};

export const SelectOptionSet: React.FC<SelectOptionSetProps> = ({ value, onChange }) => {
	const { t } = useI18n();
	const [options, setOptions] = useState<Option[]>(value || []);
	const handleChange = (id: string, label: string) => {
		const newOptions = options.map((option) => {
			if (option.id === id) {
				return { ...option, label };
			}
			return option;
		});
		setOptions(newOptions);
		onChange(newOptions);
	};
	const handleAdd = () => {
		setOptions([...options, { id: uuid(), label: '' }]);
	};
	const handleDelete = (id: string) => {
		const newOptions = options.filter((option) => option.id !== id);
		setOptions(newOptions);
		onChange(newOptions);
	};
	return (
		<div className={style['select-option-set']}>
			<div className={style['select-option-set-list']}>
				{options.map((option) => (
					<Fragment key={option.id}>
						<div className={style['select-option-set-item']}>
							<Input
								placeholder={t('workflow:start.selectOption.inputOption')}
								value={option.label}
								onChange={(v) => handleChange(option.id, v)}
							/>
						</div>
						<Button size="small" className={style['select-option-set-delete-btn']} onClick={() => handleDelete(option.id)} icon={<IconDelete />} />
					</Fragment>
				))}
			</div>
			<div className={style['select-option-set-btn']}>
				<Button size="small" onClick={handleAdd} icon={<IconPlus />}>
					{t('workflow:start.selectOption.addOption')}
				</Button>
			</div>
		</div>
	);
};
