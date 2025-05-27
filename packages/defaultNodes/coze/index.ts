import { DPBaseNode, DPNodeInnerData, DPVarData, DPVarType } from '@deep-sight/workflow';
import { CozeComponent, CozeIcon, CozeSet } from './CozeComponent';
import { observe } from '@deep-sight/dp-event';
import { CozeAPI, COZE_CN_BASE_URL, RoleType, OpenSpaceData, ListBotData, ChatStatus } from '@coze/api';
// pat_Ee1DXH5fZtNFCzB25And7Am3PteVyr7oVmsiC6qCnsHJrOEdeMCttsFgXx08n7nw

export type CozeInnerData = DPNodeInnerData & {
	accessToken?: string;
	spaceId?: string;
	botId?: string;
	chatContent?: string;
	chatOutput?: DPVarData;
};

export class CozeNode extends DPBaseNode<CozeInnerData> {
	get singleRunAble() {
		return true;
	}

	get accessToken() {
		return this.data.accessToken;
	}

	set accessToken(value: string) {
		this.data.accessToken = value;
		this.initCoze(value);
	}

	get chatOutput() {
		return this.data.chatOutput;
	}

	set chatOutput(value: DPVarData) {
		this.data.chatOutput = value;
	}

	coze: CozeAPI;
	@observe
	spaces: OpenSpaceData;
	@observe
	bots: ListBotData;

	async initCoze(accessToken: string) {
		if (!accessToken) return;

		this.coze = new CozeAPI({
			baseURL: COZE_CN_BASE_URL,
			token: accessToken,
			allowPersonalAccessTokenInBrowser: true
		});
		this.spaces = await this.coze.workspaces.list();
		this.getCozeBots();
	}

	async getCozeBots() {
		if (!this.data.spaceId) return;
		this.bots = await this.coze.bots.list({
			space_id: this.data.spaceId
		});
	}

	async changeSpace(spaceId: string) {
		this.data.spaceId = spaceId;
		this.getCozeBots();
	}

	async chat() {
		if (!this.data.botId || !this.data.chatContent) {
			throw new Error('请先选择智能体，并输入对话内容');
		}
		const res = await this.coze.chat.createAndPoll({
			bot_id: this.data.botId,
			additional_messages: [
				{
					role: RoleType.User,
					content_type: 'text',
					content: this.data.chatContent
				}
			]
		});
		if (res.chat.status === ChatStatus.COMPLETED) {
			for (const item of res.messages || []) {
				this.runlog = {
					time: Date.now(),
					msg: `[${item.role}]:[${item.type}]:${item.content}`,
					type: 'info'
				};
			}
			this.runlog = {
				time: Date.now(),
				msg: JSON.stringify(res.messages),
				type: 'info'
			};
		} else {
			throw new Error('对话失败，请检查智能体和工作流是否正确，确认coze余额是否充足。');
		}
	}

	init(data: CozeInnerData) {
		this.initCoze(data.accessToken);
		if (!data.chatOutput) {
			data.chatOutput = {
				key: 'chatOutput',
				type: DPVarType.String
			};
		}
	}

	async runSelf(): Promise<void> {
		await this.chat();
	}
}

DPBaseNode.registerType({
	type: 'Coze',
	model: CozeNode,
	icon: CozeIcon,
	iconColor: '#296dff',
	NodeComponent: CozeComponent, // 节点显示组件
	SetComponent: CozeSet, // 配置组件
	label: '扣子(Coze)',
	desc: '连接扣子(Coze)智能体或工作流',
	group: 'platformApi'
});
