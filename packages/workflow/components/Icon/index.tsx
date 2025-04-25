import React, { CSSProperties } from 'react';
import { IconType } from './fonts/iconfont-main-type';
import './index.less';

type SelfProps = {
	name: IconType;
	symbol?: boolean; // 默认是字体图标
	style?: CSSProperties;
	className?: string;
	title?: string;
	onClick?: (e?: React.MouseEvent<HTMLDivElement>) => void;
};
export const Icon: React.FC<SelfProps> = ({ name, className, symbol = false, style, title, onClick }) => {
	return (
		<span title={title} onClick={onClick} className={className || ''}>
			{symbol ? (
				<svg className={`icon svg-icon`} aria-hidden="true" style={style || {}}>
					<use xlinkHref={`#dp-${name}`} />
				</svg>
			) : (
				<i className={`dpfont dp-${name}`} style={style || {}} />
			)}
		</span>
	);
};
