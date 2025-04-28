import { FC } from 'react';
import { DPEvent } from '../../base';
import { Node } from '@xyflow/react';
import { DPVar, DPVarType } from './var';
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
    type: BlockEnum;
    model: new (owner: DPWorkflow, data?: DPNodeData) => DPBaseNode;
    NodeComponent: FC<NodeComponentProps>;
    SetComponent?: FC<NodeComponentProps>;
    group: 'hide' | 'sys' | 'ai' | 'autoTool' | 'platformApi' | 'custom';
    width?: number;
    height?: number;
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
    dpNodeType: BlockEnum;
    title?: string;
    desc?: string;
    inputs?: {
        key: string;
        type: DPVarType;
    }[];
    outputs?: {
        key: string;
        type: DPVarType;
    }[];
    failRetryEnable?: boolean;
    retryInterval?: number;
    maxRetryTimes?: number;
};
export type DPNodeData<T extends DPNodeInnerData = DPNodeInnerData> = Omit<Node<T>, 'id'> & {
    id?: string;
};
type DPBaseNodeEvent = {
    stoping: () => void;
};
export declare abstract class DPBaseNode<T extends DPNodeInnerData = DPNodeInnerData> extends DPEvent<DPBaseNodeEvent> {
    static types: {
        [type: string]: DPRegisterNode;
    };
    static registerType(item: DPRegisterNode): void;
    owner: DPWorkflow;
    private _nodeData;
    active: boolean;
    runningStatus: NodeRunningStatus;
    errorHandleMode: ErrorHandleMode;
    private _runlogs;
    private _vars;
    _nextRunNode: DPBaseNode;
    singleRunning: boolean;
    private _outputs;
    private _inputs;
    get outputs(): DPVar[];
    get inputs(): DPVar[];
    set runlog(val: LogData);
    get runlogs(): LogData[];
    set runlogs(val: LogData[]);
    get vars(): DPVar[];
    set vars(val: DPVar[]);
    get nodeData(): DPNodeData<T>;
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
    getContext(): Promise<{}>;
    get runSingleNeedAssignVars(): DPVar[];
    constructor(owner: DPWorkflow, nodeData: DPNodeData<T>);
    init?(data: T): void;
    addInput(): void;
    removeInput(index: number): void;
    addOutput(): void;
    removeOutput(index: number): void;
    toCenter(): void;
    runSingle(): Promise<void>;
    stop(): Promise<void>;
    run(params?: {
        runMode: 'single';
    }): Promise<void>;
    abstract runSelf(): Promise<void>;
}
export {};
