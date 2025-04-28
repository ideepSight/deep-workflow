import React, { useState } from 'react';
import style from './SelectOptionSet.module.less';
import { Button, Input } from '@arco-design/web-react';
import { uuid } from 'short-uuid';
import { IconDelete, IconPlus } from '@arco-design/web-react/icon';

type Option = {
	id: string;
	label: string;
};

type SelectOptionSetProps = {
	value?: Option[];
	onChange?: (value: Option[]) => void;
};

export const SelectOptionSet: React.FC<SelectOptionSetProps> = ({ value, onChange }) => {
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
					<>
						<div key={option.id} className={style['select-option-set-item']}>
							<Input placeholder="请输入选项" value={option.label} onChange={(v) => handleChange(option.id, v)} />
						</div>
						<Button size="small" className={style['select-option-set-delete-btn']} onClick={() => handleDelete(option.id)} icon={<IconDelete />} />
					</>
				))}
			</div>
			<div className={style['select-option-set-btn']}>
				<Button size="small" onClick={handleAdd} icon={<IconPlus />}>
					添加选项
				</Button>
			</div>
		</div>
	);
};
