import { FC } from 'react';
import { DPEvent } from '../../dp-event';
import { Node } from '@xyflow/react';
import { DPVar, DPVarData } from './var';
import { DPWorkflow } from './workflow';
export declare enum BlockEnum {
    Start = "start",
    End = "end",
    IfElse = "if-else",
    Code = "code",
    LoopStart = "loop-start",
    Loop = "loop",
    HttpRequest = "http-request",
    Tool = "tool",
    LLM = "llm",
    Agent = "agent",
    Answer = "answer",
    KnowledgeRetrieval = "knowledge-retrieval",
    QuestionClassifier = "question-classifier",
    TemplateTransform = "template-transform",
    ParameterExtractor = "parameter-extractor",
    Iteration = "iteration",
    DocExtractor = "document-extractor",
    ListFilter = "list-operator",
    IterationStart = "iteration-start"
}
export declare enum ErrorHandleMode {
    Terminated = "terminated",
    ContinueOnError = "continue-on-error"
}
export declare enum NodeRunningStatus {
    NotStart = "not-start",
    Waiting = "waiting",
    Running = "running",
    Succeeded = "succeeded",
    Failed = "failed",
    Exception = "exception",
    Retry = "retry"
}
export type NodeComponentProps<T extends DPBaseNode = DPBaseNode> = {
    node: T;
};
export type DPRegisterNode = {
    label: string;
    desc: string;
    icon: FC;
    iconColor?: string;
    type: BlockEnum | string;
    model: new (owner: DPWorkflow | INodeOwner, data?: DPNodeData | INodeData) => DPBaseNode;
    NodeComponent: FC<NodeComponentProps>;
    SetComponent?: FC<NodeComponentProps>;
    group: 'hide' | 'sys' | 'ai' | 'autoTool' | 'platformApi' | 'custom';
    width?: number;
    height?: number;
    supportMCP?: boolean;
    localPath?: string;
};
export type LogData = {
    time: number;
    msg: string;
    type: 'info' | 'warning' | 'error';
};
export type EnableVar = {
    id: string;
    node: DPBaseNode;
    vars: DPVar[];
};
export type DPNodeInnerData = {
    dpNodeType: BlockEnum | string;
    title?: string;
    desc?: string;
    inputs?: DPVarData[];
    outputs?: DPVarData[];
    failRetryEnable?: boolean;
    retryInterval?: number;
    maxRetryTimes?: number;
};
export type DPNodeData<T extends DPNodeInnerData = DPNodeInnerData> = Omit<Node<T>, 'id'> & {
    id?: string;
};
export interface INodeOwner {
    classType: 'DPWorkflow' | string;
    runlogs?: LogData[];
    NodeTypeItemTypes: {
        [type: string]: DPRegisterNode;
    };
    emit: (event: string, ...args: any[]) => void;
}
export interface INodeData<T extends DPNodeInnerData = DPNodeInnerData> {
    id?: string;
    position?: {
        x: number;
        y: number;
    };
    parentId?: string;
    data: T;
    [key: string]: any;
}
type DPBaseNodeEvent = {
    stoping: () => void;
};
export declare abstract class DPBaseNode<T extends DPNodeInnerData = DPNodeInnerData> extends DPEvent<DPBaseNodeEvent> {
    static types: {
        [type: string]: DPRegisterNode;
    };
    static registerType(item: DPRegisterNode): void;
    private _disposer;
    private _owner;
    isInMCP: boolean;
    get owner(): DPWorkflow | INodeOwner;
    set owner(val: DPWorkflow | INodeOwner);
    private _nodeData;
    modified: boolean;
    active: boolean;
    runningStatus: NodeRunningStatus;
    errorHandleMode: ErrorHandleMode;
    private _runlogs;
    private _vars;
    _nextRunNode: DPBaseNode;
    singleRunning: boolean;
    get outputs(): DPVar[];
    get inputs(): DPVar[];
    set runlog(val: LogData);
    get runlogs(): LogData[];
    set runlogs(val: LogData[]);
    get vars(): DPVar[];
    get nodeData(): DPNodeData<T> | INodeData<T>;
    get parentId(): string;
    get parentNode(): DPBaseNode<DPNodeInnerData>;
    get data(): T;
    get id(): string;
    get title(): string;
    get nodeConfig(): DPRegisterNode;
    get prevNodes(): DPBaseNode<DPNodeInnerData>[];
    get nextNodes(): DPBaseNode<DPNodeInnerData>[];
    get nextRunNode(): DPBaseNode<DPNodeInnerData>;
    get enableVars(): EnableVar[];
    abstract get singleRunAble(): boolean;
    getContext(): Promise<Record<string, string | number> | Record<string, DPVar>>;
    get runSingleNeedAssignVars(): DPVar[];
    constructor(owner: DPWorkflow | INodeOwner, nodeData: DPNodeData<T> | INodeData<T>);
    init?(data: T): void;
    addInput(params?: DPVarData): void;
    removeInput(input: DPVar): void;
    addOutput(params?: DPVarData): void;
    removeOutput(output: DPVar): void;
    toCenter(): void;
    runSingle(): Promise<void>;
    stop(): Promise<void>;
    run(params?: {
        runMode: 'single';
    }): Promise<void>;
    runExpression(expression: string, context?: Record<string, any>): any;
    abstract runSelf(): Promise<any>;
}
export {};
