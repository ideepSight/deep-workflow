import React, { useContext, useEffect } from 'react';
import { WorkfowContext } from './context';
import { IconClose } from '@arco-design/web-react/icon';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';
import { useI18n } from '../i18n';

export const DPRunLog: React.FC = observer(() => {
	const { workflowIns } = useContext(WorkfowContext);
	const [open, setOpen] = React.useState(false);
	const { t } = useI18n();

	useEffect(() => {
		if (workflowIns.runlogs.length > 0) {
			setOpen(true);
		}
	}, [workflowIns.runlogs.length]);
	return (
		<div className={classNames('runlog-wrap', { open })}>
			<div className="top-wrap">
				<b>{t('workflow:runlog.title')}</b>
				<div className="close" onClick={() => setOpen(false)}>
					<IconClose />
				</div>
			</div>
			<div className="runlog-area error-info-p">
				<div>
					{workflowIns.runlogs.map((log, i) => {
						const parentNode = log.node.parentNode;
						return (
							<p key={log.time + log.msg + i} className={classNames({ [log.type]: true })}>
								<span>{dayjs(log.time).format('MM-DD HH:mm:ss')}</span>【
								<div className="log-node" onClick={() => (parentNode || log.node).toCenter()}>
									{(parentNode ? `${parentNode.title} - ` : '') + log.node.title}
								</div>
								】- {log.msg}
							</p>
						);
					})}
				</div>
			</div>
		</div>
	);
});
