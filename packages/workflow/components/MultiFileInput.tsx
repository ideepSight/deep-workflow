import React, { useRef } from 'react';
import { Button, Tag, Space } from '@arco-design/web-react';
import { IconUpload, IconClose } from '@arco-design/web-react/icon';
import { t } from '..';

interface MultiFileInputProps {
	value?: File[];
	onChange?: (files: File[]) => void;
	accept?: string;
	placeholder?: string;
	multiple?: boolean;
}

export const MultiFileInput: React.FC<MultiFileInputProps> = ({
	value = [],
	onChange,
	accept,
	placeholder,
	multiple = true
}) => {
	const inputRef = useRef<HTMLInputElement>(null);

	const handleClick = () => {
		inputRef.current?.click();
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files && files.length > 0) {
			const newFiles = Array.from(files);
			if (multiple) {
				onChange?.([...value, ...newFiles]);
			} else {
				onChange?.(newFiles);
			}
		}
		// 重置 input，允许再次选择相同文件
		e.target.value = '';
	};

	const handleRemove = (index: number) => {
		const newFiles = [...value];
		newFiles.splice(index, 1);
		onChange?.(newFiles);
	};

	return (
		<div className="multi-file-input">
			<input
				ref={inputRef}
				type="file"
				accept={accept}
				multiple={multiple}
				onChange={handleFileChange}
				style={{ display: 'none' }}
			/>
			<Button type="outline" icon={<IconUpload />} onClick={handleClick}>
				{placeholder || t('workflow:runInputModal.selectFiles')}
			</Button>
			{value.length > 0 && (
				<div style={{ marginTop: 8 }}>
					<Space wrap>
						{value.map((file, index) => (
							<Tag
								key={`${file.name}-${index}`}
								closable
								onClose={() => handleRemove(index)}
								style={{ maxWidth: 200 }}
							>
								<span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
									{file.name}
								</span>
							</Tag>
						))}
					</Space>
				</div>
			)}
		</div>
	);
};

export default MultiFileInput;
