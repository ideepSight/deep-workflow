import React, { FC } from 'react';
import { FormItemType } from '../../../workflow';
import { IconAlignLeft, IconCopy, IconDriveFile, IconFontColors, IconPlus, IconSelectAll } from '@arco-design/web-react/icon';

type Props = {
	className?: string;
	type: FormItemType;
};

const getIcon = (type: FormItemType) => {
	return (
		(
			{
				[FormItemType.textInput]: IconFontColors,
				[FormItemType.paragraph]: IconAlignLeft,
				[FormItemType.select]: IconSelectAll,
				[FormItemType.number]: IconPlus,
				[FormItemType.singleFile]: IconDriveFile,
				[FormItemType.multiFiles]: IconCopy
			} as unknown
		)[type] || IconFontColors
	);
};

const InputVarTypeIcon: FC<Props> = ({ className, type }) => {
	const Icon = getIcon(type);
	return <Icon className={className} style={{ width: 24, height: 24 }} />;
};
export default React.memo(InputVarTypeIcon);
