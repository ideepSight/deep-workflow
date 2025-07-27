import { DPBaseNode, DPNodeInnerData, DPVar, DPVarType, FormItemType, SelectInputVarValue, getVarValue, toFlatEnableVars } from '@deep-sight/workflow';
import { UrlDownload, UrlDownloadIcon, UrlDownloadSet } from './UrlDownload';
// import { app } from '@deep-sight/observable';
import path from 'path';

export type UrlDownloadInnerData = DPNodeInnerData & {
	urlConfig: SelectInputVarValue;
	header?: string;
	downloadDir: SelectInputVarValue;
};

export class UrlDownloadNode extends DPBaseNode<UrlDownloadInnerData> {
	get singleRunAble() {
		return true;
	}

	downloadFilePathVar: DPVar;

	get hasSelfEnableVars() {
		const enableVars = this.enableVars;
		if (this.data.downloadDir) {
			return [...enableVars, { id: this.id, node: this, vars: [this.downloadFilePathVar] }];
		} else {
			return enableVars;
		}
	}

	get runSingleNeedAssignVars() {
		const needAssignVars: DPVar[] = super.runSingleNeedAssignVars;
		if (this.data.urlConfig.mode === 'var') {
			let varItem = this.data.urlConfig.innerValue;
			if (!varItem) {
				varItem = new DPVar(
					{
						key: 'url',
						name: '下载地址',
						type: DPVarType.String,
						formInfo: {
							fieldType: FormItemType.textInput,
							placeholder: '请输入下载地址',
							required: true
						}
					},
					this
				);
				this.data.urlConfig.innerValue = varItem;
			} else if (typeof varItem === 'string') {
				varItem = toFlatEnableVars(this.enableVars).find((v) => v.varFullkey === varItem)?.value;
			}
			varItem && needAssignVars.push(varItem);
		}
		if (this.data.downloadDir.mode === 'var') {
			let varItem = this.data.downloadDir.innerValue;
			if (!varItem) {
				varItem = new DPVar(
					{
						key: 'downloadDir',
						name: '下载至文件夹',
						type: DPVarType.String,
						formInfo: {
							fieldType: FormItemType.dir,
							placeholder: '请选择下载目录',
							required: true
						}
					},
					this
				);
			} else if (typeof varItem === 'string') {
				varItem = toFlatEnableVars(this.enableVars).find((v) => v.varFullkey === varItem)?.value;
			}
			varItem && needAssignVars.push(varItem);
		}
		return needAssignVars;
	}

	init(data: UrlDownloadInnerData) {
		if (!data.downloadDir) {
			data.downloadDir = { mode: 'input' };
		}
		if (!data.urlConfig) {
			data.urlConfig = { mode: 'input' };
		}
		if (!data.header) {
			data.header = '{}';
		}

		this.downloadFilePathVar = new DPVar(
			{
				key: 'downloadFilePath',
				name: '下载的文件路径',
				type: DPVarType.String
			},
			this
		);
	}

	async runSelf(): Promise<void> {
		const context = await this.getContext();
		const url = this.data.urlConfig.mode === 'input' ? this.data.urlConfig.inputValue : getVarValue(this.data.urlConfig.innerValue, context);
		const downloadDir = this.data.downloadDir.mode === 'input' ? this.data.downloadDir.inputValue : getVarValue(this.data.downloadDir.innerValue, context);
		let header = {};
		try {
			header = JSON.parse(this.data.header);
		} catch (error) {
			throw new Error('header is not a valid json');
		}
		let filePath = '';
		try {
			filePath = path.join(downloadDir, path.basename(url));
		} catch (error) {
			throw new Error('无效的下载目录');
		}
		try {
			// await app.utils.downloadFile(url, filePath, header);
			console.log('url', url);
			console.log('filePath', filePath);
			this.downloadFilePathVar.value = filePath;
		} catch (error) {
			throw new Error(`下载失败 ${error.message || '未知错误'}`);
		}
	}
}

DPBaseNode.registerType({
	type: '@deep-sight/node-downloader',
	model: UrlDownloadNode,
	icon: UrlDownloadIcon,
	iconColor: '#b8c595',
	NodeComponent: UrlDownload, // 节点显示组件
	SetComponent: UrlDownloadSet, // 配置组件
	label: '下载',
	desc: '通过链接下载文件到本地',
	group: 'autoTool',
	supportMCP: true
});
