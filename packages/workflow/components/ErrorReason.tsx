import { IconCaretRight } from "@arco-design/web-react/icon";
import React, { useState } from "react";

export const ErrorReason: React.FC<{ reason: Error }> = ({ reason }) => {
	const [open, setOpen] = useState(false);
	return (
		<>
			<div className="error-reason">
				<IconCaretRight
					onClick={() => setOpen(!open)}
					className="error-open-icon"
					style={{ transform: open ? 'rotate(90deg)' : 'none' }}
				/>
				{reason.message}
			</div>
			{open ? <pre className="error-reason-stack">{reason?.stack}</pre> : null}
		</>
	);
};
