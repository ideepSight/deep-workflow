const resources = {
	en: {
		workflow: {
			error: {
				title: 'Error',
				nodeTypeNotRegistered: 'Node type {{nodeType}} not registered'
			},
			cancelRun: 'User cancelled the run',
			save: 'Save',
			run: 'Run',
			node: {
				startOnlyOne: 'Only one start/end node allowed',
				deleteStart: 'Start node cannot be deleted',
				connectSelf: 'Cannot connect to itself',
				connectOnce: 'Only one connection per handle',
				connectLoop: 'Only connect nodes in the same loop',
				notFoundStart: 'Start node not found',
				running: 'Running',
				stopped: 'Stopped',
				warning: 'Warning',
				error: 'Error'
			},
			selectInputType: {
				'text-input': 'Text',
				radio: 'Radio',
				select: 'Select',
				number: 'Number',
				file: 'File',
				'file-list': 'File List'
			},
			copyright: 'Deep-workflow',
			nodePane: {
				noConfig: 'No configuration required',
				titleRequired: 'Title cannot be empty',
				titlePattern: 'Must start with a letter, Chinese, _ or $',
				running: 'Running',
				runStep: 'Run this step',
				stopStep: 'Stop this step',
				confirmDelete: 'Are you sure to delete this node?',
				delete: 'Delete',
				inputDesc: 'Enter description',
				retryOnFail: 'Retry on failure',
				maxRetry: 'Max retry times',
				times: 'times',
				retryInterval: 'Retry interval',
				seconds: 'millisecond'
			},
			expressionLine: {
				error: 'Expression error',
				supportComplex: 'Support complex variable operations, e.g.:',
				supportChain: 'Variables support chain call, e.g.:'
			},
			simpleExpression: {
				error: 'Expression error',
				supportSimple: 'Support simple expressions',
				varTip: 'Use "/" to call out variables',
				connectVarNode: 'Please connect a node with variables first',
				input: 'Please enter'
			},
			codeEditor: {
				error: 'Code error',
				jsonError: 'JSON format error',
				jsonErrorKey: 'JSON keys cannot contain backslashes',
			},
			selectVar: {
				connectVarNode: 'Please connect a node with variables first',

				selectVar: 'Select variable'
			},
			runInputModal: {
				input: 'Please enter',
				inputNumber: 'Please enter a number',
				select: 'Please select',
				selectFile: 'Please select a file',
				selectFiles: 'Please select files (multiple)',
				startRun: 'Start Run'
			},
			runlog: {
				title: 'Run Log'
			},
			baseNode: {
				cannotRunSingle: 'Node cannot run independently',
				startRun: 'Start running',
				runSuccess: 'Run succeeded',
				runFail: 'Run failed, {{error}}',
				errorMsg: 'Error: {{msg}}',
				retrying: 'Run failed, retrying {{count}} times, {{error}}',
				retryFail: 'Failed after retrying {{max}} times, {{error}}',
				stopped: 'Stopped midway'
			},
			controls: {
				fitView: 'Fit View',
				undo: 'Undo',
				redo: 'Redo',
				layout: 'Layout',
				pointer: 'Pointer Mode',
				hand: 'Hand Mode'
			},
			addNodeMenu: {
				sys: 'System Node',
				ai: 'AI Node',
				autoTool: 'Automation/Tool',
				platformApi: 'Platform Connection',
				custom: 'Custom Node'
			},
			validate: {
				noAssignment: 'Expression cannot contain assignment operations',
				undefinedVar: 'Undefined variable: {{var}}',
				needMain: 'Code must contain a main function',
				mainReturnObject: 'main function must return an object',
				duplicateKey: 'Duplicate return key: {{key}}',
				undefinedVarCode: 'Contains undefined variable: {{var}}'
			},
			start: {
				registLabel: 'Start',
				registDesc: 'Workflow Start',
				inputField: 'Input Field',
				varType: 'Variable Type',
				fieldType: 'Field Type',
				varName: 'Variable Name',
				label: 'Display Name',
				defaultValue: 'Default Value',
				none: 'None',
				placeholder: 'Placeholder',
				required: 'Required',
				yes: 'Yes',
				no: 'No',
				addField: 'Add Field',
				inputModal: {
					fieldType: 'Field Type',
					select: 'Please select',
					varName: 'Variable Name',
					input: 'Please enter',
					pattern: 'Must start with a letter, Chinese, _ or $',
					patternPlaceholder: 'Start with a letter, Chinese, _ or $',
					label: 'Display Name',
					defaultValue: 'Default Value',
					optional: 'Optional',
					placeholder: 'Placeholder',
					options: 'Options',
					filetypes: 'Supported File Types',
					selectFileType: 'Select File Type',
					doc: 'Document',
					img: 'Image',
					audio: 'Audio',
					video: 'Video',
					all: 'All Files',
					required: 'Required',
					editField: 'Edit Input Field',
					addField: 'Add Input Field'
				},
				selectOption: {
					inputOption: 'Please enter option',
					addOption: 'Add Option'
				}
			},
			code: {
				codeComment: 'You can use variables from previous nodes',
				outputComment: 'Output variables',
				output1: 'Output 1 from code',
				output2: 'Output 2 from code',
				runError: 'Code execution error:',
				runFail: 'Code execution failed: {{msg}}',
				label: 'Code',
				desc: 'Run a piece of code',
				outputVar: 'Output Variables',
				outputTip: 'No configuration required, automatically obtained from return in code',
				noOutput: 'No output fields',
				outputReadonlyTip: 'Output variables are read-only'
			},
			loop: {
				varNotExist: 'Loop variable does not exist',
				expRunError: 'Expression execution error:',
				expRunFail: 'Expression execution failed: {{msg}}',
				label: 'Loop',
				desc: 'Loop node',
				addNode: 'Add Node',
				byCount: 'By Count',
				byVar: 'By Array Variable',
				loopVar: 'Loop Variable',
				noArrayVar: 'No array variable in previous node',
				count: 'Count',
				outputVar: 'Output Variables',
				addOutput: 'Add Variable'
			},
			loopStart: {
				label: 'Loop Start'
			},
			end: {
				label: 'End',
				desc: 'Workflow End'
			},
			ifElse: {
				label: 'If/Else',
				desc: 'Conditional Node',
				if: 'IF',
				else: 'ELSE',
				condition: 'condition',
				addCondition: 'Add Condition',
				deleteCondition: 'Delete Condition',
				expConfigError: 'Expression configuration error',
				expRunError: 'Expression execution error:',
				expRunFail: 'Expression execution failed: {{msg}}',
				elseDescription: 'If the condition is not met, execute the ELSE block',
				elseEdgeNotFound: 'Else edge not found'
			},
			vars: {
				noChildOutputVar: 'Please connect to a node with variables first',
				connectVarNode: 'Please connect to a node with variables first',
				noEmpty: 'Cannot be empty',
				noRepeat: 'Cannot repeat',
				selectOption: 'Select Option',
				selectVar: 'Select Variable',
				selectInput: 'Select Input'
			}
		}
	},
	zh: {
		workflow: {
			error: {
				title: '错误',
				nodeTypeNotRegistered: '节点 {{nodeType}} 未注册'
			},
			cancelRun: '用户取消了运行',
			save: '保存',
			delNode: '删除节点',
			run: '运行',
			node: {
				startOnlyOne: '开始节点或结束节点只能有一个',
				deleteStart: '开始节点不能删除',
				connectSelf: '不允许连接到自己',
				connectOnce: '一个连接桩只能连接一个节点',
				connectLoop: '只能连接同一循环节点下的节点',
				notFoundStart: '未找到开始节点',
				running: '正在运行',
				stopped: '已停止',
				warning: '警告',
				error: '错误'
			},
			selectInputType: {
				'text-input': '文本',
				radio: '单选',
				select: '下拉多选',
				number: '数字',
				file: '单文件',
				'file-list': '文件列表'
			},
			copyright: 'Deep-workflow',
			nodePane: {
				noConfig: '无需配置',
				titleRequired: '标题不能为空',
				titlePattern: '需以字母、中文、_或$开头',
				running: '运行中',
				runStep: '运行此步骤',
				stopStep: '停止此步骤',
				confirmDelete: '确定删除此节点吗？',
				delete: '删除',
				inputDesc: '输入描述',
				retryOnFail: '失败时重试',
				maxRetry: '最大重试次数',
				times: '次',
				retryInterval: '重试间隔',
				seconds: '毫秒'
			},
			expressionLine: {
				error: '表达式错误',
				supportComplex: '支持变量复杂运算，如：',
				supportChain: '变量支持链式呼出，如：'
			},
			simpleExpression: {
				error: '表达式错误',
				supportSimple: '支持输入简易表达式',
				varTip: '符号"/"可呼出变量',
				connectVarNode: '无变量来源',
				input: '请输入'
			},
			codeEditor: {
				error: '代码错误',
				jsonError: 'JSON 格式错误',
				jsonErrorKey: 'JSON 键名不能包含斜杠',
			},
			selectVar: {
				connectVarNode: '无变量来源',

				selectVar: '使用变量'
			},
			runInputModal: {
				input: '请输入',
				inputNumber: '请输入数字',
				select: '请选择',
				selectFile: '请选择文件',
				selectFiles: '请选择文件（多选）',
				startRun: '开始运行'
			},
			runlog: {
				title: '运行日志'
			},
			baseNode: {
				cannotRunSingle: '节点不能独立运行',
				startRun: '开始运行',
				stop: '停止',
				confirmDelete: '确定删除此节点吗？',
				runSuccess: '运行完成',
				runFail: '运行失败，{{error}}',
				errorMsg: '{{msg}}',
				retrying: '运行失败，正在重试第{{count}}次,{{error}}',
				retryFail: '重试{{max}}次后运行失败,{{error}}',
				stopped: '中途停止'
			},
			controls: {
				fitView: '自适应',
				undo: '撤销',
				redo: '重做',
				layout: '整理布局',
				pointer: '框选模式',
				hand: '拖动模式'
			},
			addNodeMenu: {
				sys: '系统节点',
				ai: '大模型节点',
				autoTool: '自动化/工具',
				platformApi: '平台连接',
				custom: '自定义节点'
			},
			validate: {
				noAssignment: '表达式不能包含赋值操作',
				undefinedVar: '未定义的变量: {{var}}',
				needMain: '代码中必须包含 main 方法',
				mainReturnObject: 'main 方法必须返回一个对象',
				duplicateKey: '返回重复的key: {{key}}',
				undefinedVarCode: '含有未定义的变量: {{var}}'
			},
			start: {
				registLabel: '开始',
				registDesc: '工作流开始',
				inputField: '输入字段',
				varType: '变量类型',
				fieldType: '字段类型',
				varName: '变量名称',
				label: '显示名称',
				defaultValue: '默认值',
				none: '无',
				placeholder: '输入提示语',
				required: '是否必填',
				yes: '是',
				no: '否',
				addField: '添加字段',
				inputModal: {
					fieldType: '字段类型',
					select: '请选择',
					varName: '变量名称',
					input: '请输入',
					pattern: '需以字母、中文、_或$开头',
					patternPlaceholder: '以字母、中文、_或$开头',
					label: '显示名称',
					defaultValue: '默认值',
					optional: '可不填',
					placeholder: '输入提示语',
					options: '选项',
					filetypes: '支持的文件类型',
					selectFileType: '选择文件类型',
					doc: '文档',
					img: '图片',
					audio: '音频',
					video: '视频',
					all: '所有文件',
					required: '必填',
					editField: '编辑输入字段',
					addField: '添加输入字段'
				},
				selectOption: {
					inputOption: '请输入选项',
					addOption: '添加选项'
				}
			},
			code: {
				codeComment: '可以直接使用前面节点的变量',
				outputComment: '输出变量',
				output1: '输出1来自代码运行',
				output2: '输出2来自代码运行',
				runError: '代码执行错误:',
				runFail: '代码执行失败: {{msg}}',
				label: '代码',
				desc: '运行一段代码',
				outputVar: '输出变量',
				outputTip: '无需配置，自动从代码里的 return 中获取',
				noOutput: '暂无输出字段',
				outputReadonlyTip: '自动从代码里的 return 中获取的参数不可修改'
			},
			loop: {
				varNotExist: '循环变量不存在',
				expRunError: '表达式执行错误:',
				expRunFail: '表达式执行失败: {{msg}}',
				label: '循环',
				desc: '循环运行节点',
				addNode: '添加节点',
				byCount: '按固定次数',
				byVar: '按数组变量',
				loopVar: '循环变量',
				noArrayVar: '前面节点没有数组',
				count: '次数',
				outputVar: '输出变量',
				addOutput: '添加变量'
			},
			loopStart: {
				label: '循环开始'
			},
			end: {
				label: '结束',
				desc: '工作流结束节点'
			},
			ifElse: {
				label: '条件判断',
				desc: '条件判断节点',
				if: '如果',
				else: '否则',
				condition: '条件',
				addCondition: '添加条件',
				deleteCondition: '删除条件',
				expConfigError: '表达式配置错误, 请检查',
				expRunError: '表达式执行错误:',
				expRunFail: '表达式执行失败: {{msg}}',
				elseDescription: '用于定义当 条件判断 不满足时应执行的逻辑。',
				elseEdgeNotFound: '没有找到 否则 连线',
				conditionSuccess: '条件成立',
			},
			vars: {
				noChildOutputVar: '请先连接有变量的子节点',
				connectVarNode: '无变量来源',
				noEmpty: '名称不能为空',
				noRepeat: '名称不能重复',
				selectOption: '切换选项选择',
				selectVar: '切换变量选择',
				selectInput: '切换输入'
			}
		}
	}
};

export default resources;
