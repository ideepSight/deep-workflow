import React, { useMemo, useState } from 'react';
import { Button, Message, Select, Tooltip } from '@arco-design/web-react';
import './index.less';
import { DPVar, DPVarType, EnableVar, SelectVar, SimpleExpression } from '../../workflow';
import { ExpressionLineEditor } from '../../workflow/components/varEditors';
import { Icon } from '../../workflow/components/Icon';

export type ExpValue = {
	mode: 'simple' | 'advanced'; // 模式
	left?: string; // 左变量
	right?: string; // 右变量
	operator?: string; // 操作符
	expression?: string; // 高级表达式
};
type ConditionExpProps = {
	enableVars?: EnableVar[];
	value?: ExpValue;
	onChange?: (value: ExpValue) => void;
};
export const ConditionExp: React.FC<ConditionExpProps> = ({ enableVars = [], value, onChange }) => {
	const splitLeft = value.left?.split('.');
	const leftItem = enableVars.find((v) => v.node.title === splitLeft?.[0])?.node.vars.find((v) => v.key === splitLeft?.[1]);

	const [varItemLeft, setVarItemLeft] = useState<DPVar | null>(leftItem || null);
	const [operator, setOperator] = useState<string>(value?.operator || 'x === y');
	const [varItemRight, setVarItemRight] = useState<string | null>(value?.right);
	const [expression, setExpression] = useState<string | null>(value?.expression);
	const [mode, setMode] = useState<'simple' | 'advanced'>(value?.mode || 'simple');

	const simpleStringValue = useMemo(() => {
		if (!varItemLeft || !varItemRight) return '';
		// operator的格式为x===y，需要替换x和y为变量名
		const res = operator.replace('x', `${varItemLeft.owner.title}.${varItemLeft.key}`).replace('y', varItemRight);
		return res;
	}, [operator, varItemLeft, varItemRight]);

	const handleChangeVarLeft = (varItem: DPVar | null) => {
		if (varItem?.type !== DPVarType.Number && varItem?.type !== DPVarType.String) {
			setMode('advanced');
			Message.warning('复杂类型请使用高级表达式');
			return;
		}
		if (varItemRight) {
			onChange && onChange({ mode, left: `${varItemLeft.owner.title}.${varItemLeft.key}`, right: varItemRight, operator });
		}
		setVarItemLeft(varItem);
	};

	const handleChangeVarRight = (varItem: string) => {
		setVarItemRight(varItem);
		onChange && onChange({ mode, left: `${varItemLeft.owner.title}.${varItemLeft.key}`, right: varItem, operator });
	};

	const handleChangeExpression = (expression: string) => {
		setExpression(expression);
		onChange && onChange({ mode, expression });
	};

	return (
		<div className="exp-wrap">
			<div className="condition-wrap">
				{mode === 'simple' ? (
					<>
						<div className="condition-left">
							<SelectVar enableVars={enableVars} value={varItemLeft} onChange={handleChangeVarLeft} />
							{varItemLeft?.type === DPVarType.Number ? (
								<Select className="condition-select" defaultValue="x === y" onChange={(value) => setOperator(value)} value={operator}>
									<Select.Option value="x === y">=</Select.Option>
									<Select.Option value="x !== y">≠</Select.Option>
									<Select.Option value="x < y">&lt;</Select.Option>
									<Select.Option value="x > y">&gt;</Select.Option>
									<Select.Option value="x <= y">≤</Select.Option>
									<Select.Option value="x >= y">≥</Select.Option>
									<Select.Option value="x === ''">为空</Select.Option>
									<Select.Option value="x !== ''">不为空</Select.Option>
								</Select>
							) : (
								<Select className="condition-select" defaultValue="x === y" onChange={(value) => setOperator(value)} value={operator}>
									<Select.Option value="x === y">相等</Select.Option>
									<Select.Option value="x !== y">不相等</Select.Option>
									<Select.Option value="x.indexOf(y) > 0">包含</Select.Option>
									<Select.Option value="x.indexOf(y) < 0">不包含</Select.Option>
									<Select.Option value="x.indexOf(y) === 0">开始是</Select.Option>
									<Select.Option value="x.indexOf(y) === x.length - 1">结束是</Select.Option>
									<Select.Option value="x === ''">为空</Select.Option>
									<Select.Option value="x !== ''">不为空</Select.Option>
								</Select>
							)}
						</div>
						<div className="condition-right">
							<SimpleExpression enableVars={enableVars} value={varItemRight} onChange={handleChangeVarRight} />
						</div>
					</>
				) : (
					<ExpressionLineEditor enableVars={enableVars} value={expression} onChange={handleChangeExpression} />
				)}
			</div>
			<Tooltip content={mode === 'simple' ? '切换高级表达式模式' : '切换简单模式'}>
				<Button
					size="mini"
					type="text"
					className="change-mode"
					onClick={() => {
						if (!expression && mode === 'simple') {
							setExpression(simpleStringValue);
						}
						setMode(mode === 'simple' ? 'advanced' : 'simple');
					}}
					icon={<Icon name="duoxunhuan" />}
				/>
			</Tooltip>
		</div>
	);
};
