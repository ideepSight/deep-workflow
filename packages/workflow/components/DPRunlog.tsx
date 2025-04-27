import React, { useContext, useEffect } from 'react';
import { WorkfowContext } from './context';
import { IconClose } from '@arco-design/web-react/icon';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';

export const DPRunLog: React.FC = observer(() => {
	const { workflowIns } = useContext(WorkfowContext);
	const [open, setOpen] = React.useState(false);

	useEffect(() => {
		if (workflowIns.runlogs.length > 0) {
			setOpen(true);
		}
	}, [workflowIns.runlogs]);
	return (
		<div className={classNames('runlog-wrap', { open })}>
			<div className="top-wrap">
				<b>运行日志</b>
				<div className="close" onClick={() => setOpen(false)}>
					<IconClose />
				</div>
			</div>
			<div className="runlog-area error-info-p">
				{workflowIns.runlogs.map((log, i) => (
					<p key={log.time + log.msg + i} className={classNames({ [log.type]: true })}>
						<span>{dayjs(log.time).format('MM-DD HH:mm:ss')}</span>【
						<div
							className="log-node"
							onClick={() => {
								log.node.toCenter();
							}}
						>
							{log.node.title}
						</div>
						】- {log.msg}
					</p>
				))}
			</div>
		</div>
	);
});
