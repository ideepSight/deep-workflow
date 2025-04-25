import { observer } from 'mobx-react-lite';
import React, { useMemo, useRef, useState } from 'react';
import { Select, Space, Tooltip } from '@arco-design/web-react';
import type { EnableVar } from '../../../workflow';
import { DPVarType } from '../../../workflow';
import { Icon } from '../../../workflow/components/Icon';
import type { SelectHandle } from '@arco-design/web-react/es/Select/interface';
import useMergeValue from './lib/useMergeValue';
import { RefInputType } from '@arco-design/web-react/es/Input';
import InputComponent from '@arco-design/web-react/es/Input/input-element';
import { Esc, Enter, ArrowUp, ArrowDown, Backspace } from './lib/getHotkeyHandler';
import { validateExpression } from './lib/validate';

interface MeasureIndex {
	location: number;
	prefix: string;
}

const FunctionalKeyCodeList = [Esc.code, Enter.code, ArrowUp.code, ArrowDown.code];

function getLastMeasureIndex(text: string, prefix: string | string[] = ''): MeasureIndex {
	const prefixList: string[] = Array.isArray(prefix) ? prefix : [prefix];
	return prefixList.reduce(
		(lastMatch: MeasureIndex, prefixStr): MeasureIndex => {
			const lastIndex = text.lastIndexOf(prefixStr);
			return lastIndex > lastMatch.location
				? {
						location: lastIndex,
						prefix: prefixStr
				  }
				: lastMatch;
		},
		{ location: -1, prefix: '' }
	);
}
function isValidSearch(text: string, split: string): boolean {
	return !split || text.indexOf(split) === -1;
}

type SelfProps = {
	enableVars: EnableVar[];
	value: string | null;
	defaultValue?: string | null;
	onChange?: (v: string | null) => void;
	size?: 'small' | 'default';
	varPrefix?: string;
	onSearch?: (text: string, prefix: string) => void;
	needValidate?: boolean;
	placeholder?: string;
};

export const SimpleExpression: React.FC<SelfProps> = observer((props) => {
	const { enableVars, defaultValue, onChange, size = 'default', varPrefix = '/', onSearch, needValidate = true, placeholder = '请输入' } = props;
	const split = ' ';
	const refSelect = useRef<SelectHandle>(null);
	const refEditarea = useRef<RefInputType>(null);
	const [value, setValue] = useState(props.value || defaultValue || '');
	const [inputValue, setInputValue] = useMergeValue<string>('', { value: undefined });
	const [measureInfo, setMeasureInfo] = useState({ measuring: false, location: 0, text: '', prefix: '' });
	const [selectValue, setSelectValue] = useState<string>();
	const [focused, setFocused] = useState(false);
	const [errMsg, setErrorMsg] = useState('');

	const handleChange = (v) => {
		onChange && onChange(v);
		if (needValidate) {
			try {
				validateExpression(v, enableVars);
				setErrorMsg('');
			} catch (error) {
				setErrorMsg(typeof error === 'string' ? error : '表达式错误');
			}
		}
	};
	const stopMeasure = () => {
		setMeasureInfo({ ...measureInfo, measuring: false, location: 0, text: '' });
	};
	const handleOptionSelect = (optionValue) => {
		const { location, prefix } = measureInfo;
		// 检测refEditarea.current是否激活状态
		if (prefix === '/') {
			const head = inputValue.slice(0, location + prefix.length - 1);
			const tail = inputValue.slice(location + prefix.length + measureInfo.text.length);
			const nextValue = `${head}${optionValue}${tail}`;
			setValue(value + nextValue);
			setInputValue('');
			setSelectValue(undefined);
			handleChange(value + nextValue);
		} else {
			const head = value.slice(0, location);
			const tail = value.slice(location + prefix.length);
			const nextValue = `${head}${optionValue}${tail}`;
			setValue(nextValue);
			setInputValue('');
			setSelectValue(undefined);
			handleChange(value);
		}
		stopMeasure();
	};

	const inputEventHandlers = {
		onKeyDown: (event) => {
			setErrorMsg('');
			const keyCode = event.keyCode || event.which;
			if (keyCode === Esc.code) {
				refEditarea.current && refEditarea.current.blur();
			}
			if (keyCode === Backspace.code) {
				if (inputValue) {
					return;
				}
				// 判断value前面是不是变量，是的话删除整个变量串，用正则匹配
				const regText = new RegExp(`(${allVars.join('|')})`, 'g');
				const matches = value.matchAll(regText);
				for (const match of matches) {
					const startIndex = match.index;
					const endIndex = startIndex + match[0].length;
					if (endIndex === value.length + inputValue.length) {
						setValue(value.slice(0, startIndex));
						return;
					}
				}
				setValue(value.slice(0, -1));
			}

			if (refSelect.current) {
				refSelect.current.hotkeyHandler(event);
				if (keyCode === Enter.code || keyCode === ArrowUp.code || keyCode === ArrowDown.code) {
					event.preventDefault();
				}
			}
			if (!measureInfo.measuring && keyCode === Enter.code) {
				event.preventDefault();
				setValue(value + inputValue);
				setInputValue('');
				handleChange(value + inputValue);
			}
		},
		onKeyUp: (event) => {
			const { key, which: keyCode, target } = event;

			// return immediately when hit any one of the function keys
			if (~FunctionalKeyCodeList.indexOf(keyCode)) {
				return;
			}

			const textBeforeSelection = target.value.slice(0, target.selectionStart);
			const { location: measureIndex, prefix: measurePrefix } = getLastMeasureIndex(textBeforeSelection, varPrefix);
			const measureText = textBeforeSelection.slice(measureIndex + measurePrefix.length);

			if (measureIndex > -1 && isValidSearch(measureText, split)) {
				if (key === measurePrefix || measureInfo.measuring || measureText !== measureInfo.text || textBeforeSelection.includes(measurePrefix)) {
					setMeasureInfo({
						measuring: true,
						text: measureText,
						prefix: measurePrefix,
						location: measureIndex
					});
				}

				onSearch && onSearch(measureText, measurePrefix);
			} else if (measureInfo.measuring) {
				stopMeasure();
			}
		},
		onFocus: () => {
			setFocused(true);
		},
		onBlur: () => {
			setFocused(false);
			setValue(value + inputValue);
			handleChange(value + inputValue);
			setInputValue('');
			stopMeasure();
		}
	};

	const allVars = useMemo(() => {
		return enableVars.flatMap(({ node, vars }) => vars.map(({ key }) => `${node.title}.${key}`));
	}, [enableVars]);
	const formatValue = useMemo(() => {
		const regText = new RegExp(`(${allVars.join('|')})`, 'g');
		// 使用循环将匹配结果拼接成 React 组件数组
		const parts: React.ReactNode[] = [];
		let lastIndex = 0;
		const matches = value.matchAll(regText);
		for (const match of matches) {
			const startIndex = match.index;
			const endIndex = startIndex + match[0].length;
			// 添加匹配前的文本
			if (startIndex > lastIndex) {
				parts.push(value.slice(lastIndex, startIndex));
			}
			// 添加匹配到的变量并包裹在 span 组件中
			const dpNode = enableVars.find(({ node }) => node.title === match[0].split('.')[0])?.node;
			if (!dpNode) {
				continue;
			}
			const varValue = match[0].split('.')[1];
			parts.push(
				<div
					key={startIndex}
					className="var-item-home-wrap"
					onClick={() => setMeasureInfo({ measuring: true, text: match[0], prefix: match[0], location: startIndex })}
				>
					<Space className="var-item-home" size={4}>
						<Space size={2}>
							{dpNode.nodeConfig.icon && dpNode.nodeConfig.icon({})}
							{dpNode.title}
						</Space>
						<b>/</b>
						<div className="var-item">
							<Space size={4}>
								<Icon className="var-fx" name="huanjingbianliang" />
								{varValue}
							</Space>
						</div>
					</Space>
				</div>
			);
			lastIndex = endIndex;
		}
		// 添加最后一段文本
		if (lastIndex < value.length) {
			parts.push(value.slice(lastIndex));
		}
		return parts;
	}, [allVars, value, enableVars]);

	return (
		<div className="arco-mentions arco-mentions-align-textarea expression-input" onClick={() => refEditarea.current.focus()}>
			<div className={`${focused ? 'arco-input-focused ' : ''} ${errMsg ? 'arco-input-error' : ''} arco-input  arco-input-size-default`}>
				<Tooltip
					content={
						<>
							支持输入简易表达式
							<br />
							符号“/”可呼出变量
						</>
					}
				>
					<div className="prefix-icon">
						<Icon name="bianliang" className="select-var-prefix" />
					</div>
				</Tooltip>
				<div className="arco-select-view">
					<div className="arco-select-inner">
						<span className="arco-select-view-selector">{formatValue}</span>
						<InputComponent
							autoComplete="off"
							autoFitWidth
							placeholder={value ? null : placeholder}
							ref={refEditarea}
							size={size}
							prefixCls={`fake-input`}
							className={`fake-input`}
							{...inputEventHandlers}
							value={inputValue}
							onChange={(v) => {
								setInputValue(v);
							}}
						/>
					</div>
				</div>
			</div>
			{errMsg && <div className="error-msg">{errMsg}</div>}
			<div className="arco-mentions-measure">
				<Select
					size={size}
					ref={refSelect}
					dropdownMenuClassName={'select-var'}
					getPopupContainer={() => document.querySelector('.workflow-wrap')}
					allowClear
					value={selectValue}
					onChange={handleOptionSelect}
					inputValue={allVars.find((v) => v === measureInfo.text) ? '' : measureInfo.text}
					triggerElement={<span className={`arco-mentions-measure-trigger`}>{measureInfo.prefix}</span>}
					triggerProps={{ popupVisible: measureInfo.measuring }}
					style={{ minWidth: 160 }}
				>
					{enableVars.map(({ id, node, vars }) => {
						if (!vars.length) return null;
						return (
							<Select.OptGroup key={id} label={node.title}>
								{vars.map((varItem) => {
									const disabled = varItem.type !== DPVarType.String && varItem.type !== DPVarType.Number;
									return (
										<Select.Option key={varItem.key} value={`${node.title}.${varItem.key}`} extra={node} disabled={disabled}>
											<Space className="option-inner">
												<div className="var-item">
													<Space size={4}>
														<Icon className="var-fx" name="huanjingbianliang" />
														{varItem.key}
													</Space>
												</div>
												<div className="desc">{varItem.type}</div>
											</Space>
										</Select.Option>
									);
								})}
							</Select.OptGroup>
						);
					})}
				</Select>
			</div>
		</div>
	);
});
