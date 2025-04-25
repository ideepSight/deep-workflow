import React, { Fragment, useContext } from 'react';
import { WorkfowContext } from './context';
import { Tooltip, Space } from '@arco-design/web-react';
import { uuid } from 'short-uuid';
import { BlockEnum, DPBaseNode, DPRegisterNode } from '../lib';
import { Icon } from '../../workflow/components/Icon';

export const AddNodeMenu: React.FC<{ blackList?: string[]; parentNode?: DPBaseNode }> = ({ blackList = [], parentNode }) => {
	const { workflowIns } = useContext(WorkfowContext);
	const nodeTypes = Object.values(DPBaseNode.types).filter((node) => !blackList.includes(node.type) && node.type !== BlockEnum.Start);
	const groups = {
		sys: nodeTypes.filter((node) => node.group === 'sys'),
		ai: nodeTypes.filter((node) => node.group === 'ai'),
		autoTool: nodeTypes.filter((node) => node.group === 'autoTool'),
		platformApi: nodeTypes.filter((node) => node.group === 'platformApi'),
		custom: nodeTypes.filter((node) => node.group === 'custom')
	};
	const groupLabels = {
		sys: '系统节点',
		ai: '大模型节点',
		autoTool: '自动化/工具',
		platformApi: '平台连接',
		custom: '自定义节点'
	};
	const handleAdd = (node: DPRegisterNode) => {
		const normalNodes = workflowIns.dpNodes.filter((n) => !n.nodeData.parentId);
		let lastNode = normalNodes.find((n) => n.active) || normalNodes[normalNodes.length - 1];
		if (parentNode) {
			const subNodes = workflowIns.dpNodes.filter((n) => n.nodeData.parentId === parentNode.id);
			lastNode = subNodes.find((n) => n.active || subNodes[subNodes.length - 1]);
		}
		const extra = parentNode
			? {
					extent: 'parent' as any,
					parentId: parentNode?.id,
					expandParent: true
			  }
			: {};
		const newNode = workflowIns.addNode({
			id: uuid(),
			position: lastNode
				? {
						x: lastNode?.nodeData.position.x + lastNode?.nodeData.width / 2 + 100 + (node.width || 200) / 2,
						y: lastNode?.nodeData.position.y
				  }
				: {
						x: 100,
						y: 100
				  },
			data: { dpNodeType: node.type },
			...extra,
			width: node.width || 200,
			height: node.height
		});
		!parentNode && newNode.toCenter();
	};
	return (
		<div className="node-menu">
			{Object.entries(groups).map(([group, nodes]) => {
				if (!nodes.length) return null;
				return (
					<Fragment key={groupLabels[group]}>
						<div className="group">{groupLabels[group]}</div>
						{nodes.map((node) => (
							<div key={node.type}>
								<Tooltip
									position="right"
									className="node-item-tooltip"
									getPopupContainer={() => document.querySelector('.workflow-wrap')}
									content={
										<>
											<div className="node-icon-wrap" style={{ background: node.iconColor }}>
												<Icon name={node.icon} />
											</div>
											{node.label}
											<p>{node.desc}</p>
										</>
									}
								>
									<div className="item" key={node.type} onClick={() => handleAdd(node)}>
										<Space className="node-name">
											<div className="node-icon-wrap" style={{ background: node.iconColor }}>
												<Icon name={node.icon} />
											</div>
											{node.label}
										</Space>
									</div>
								</Tooltip>
							</div>
						))}
					</Fragment>
				);
			})}
		</div>
	);
};
// <div className="node-menu">
// 	<div className="group">系统节点</div>
// 	<div className="item" key="1">
// 		开始
// 	</div>
// 	<div className="item" key="2">
// 		结束
// 	</div>
// 	<div className="item" key="3">
// 		条件分支
// 	</div>
// 	<div className="group">大模型节点</div>
// 	<div className="item" key="1">
// 		大语言模型LLM
// 	</div>
// 	<div className="item" key="2">
// 		AI Agent
// 	</div>
// 	<div className="item" key="3">
// 		MCP 服务
// 	</div>
// 	<div className="group">自动化/工具</div>
// 	<div className="item" key="1">
// 		浏览器工具
// 	</div>
// 	<div className="item" key="2">
// 		RPA自动化
// 	</div>
// 	<div className="group">平台连接</div>
// 	<div className="item" key="1">
// 		扣子流程
// 	</div>
// 	<div className="item" key="2">
// 		Dify流程
// 	</div>
// 	<div className="item" key="2">
// 		LibLib流程
// 	</div>
// </div>
