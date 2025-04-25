import React, { FC } from 'react';
import { RiAlignLeft, RiCheckboxMultipleLine, RiFileCopy2Line, RiFileList2Line, RiHashtag, RiTextSnippet } from '@remixicon/react';
import { FormItemType } from '..';

type Props = {
	className?: string;
	type: FormItemType;
};

const getIcon = (type: FormItemType) => {
	return (
		(
			{
				[FormItemType.textInput]: RiTextSnippet,
				[FormItemType.paragraph]: RiAlignLeft,
				[FormItemType.select]: RiCheckboxMultipleLine,
				[FormItemType.number]: RiHashtag,
				[FormItemType.singleFile]: RiFileList2Line,
				[FormItemType.multiFiles]: RiFileCopy2Line
			} as unknown
		)[type] || RiTextSnippet
	);
};

const InputVarTypeIcon: FC<Props> = ({ className, type }) => {
	const Icon = getIcon(type);
	return <Icon className={className} />;
};
export default React.memo(InputVarTypeIcon);
