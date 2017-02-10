/**
 * Created by taozeyu on 2017/2/10.
 */

import {Chain} from "./chain";

interface Node<E> {
    readonly element?: E;
    next?: Node<E>;
}

export interface NodeHubResource {
    // push a element to some NodeHub if success.
    // not pushing any elements if fail.
    prepareMoreElements(): boolean;
}

class NodeHub<E> {

    public currentNode: Node<E> = {};
    private didClose: boolean = false;
    private id: number = 0;

    private static nextId: number = 0;

    public constructor(
        private readonly resource: NodeHubResource,
    ) {
        this.id = NodeHub.nextId++;
    }

    public pushElement(element: E): void {
        const node = {element};
        this.currentNode.next = node;
        this.currentNode = node;
    }

    // return undefined if hub was closed.
    public catchNext(node: Node<E>): Node<E> | undefined {
        if (this.didClose) {
            return undefined;
        }
        while (!node.next) {
            const id = this.id;
            const success = this.resource.prepareMoreElements();
            if (!success) {
                this.didClose = true;
                return undefined;
            }
        }
        return node.next;
    }
}

class ChainFromHub<E> implements Chain<E> {

    private count: number = 0;
    private latestSupportNode: Node<E> | undefined;

    public constructor(
        private readonly chain: Chain<E>,
        private readonly hub: NodeHub<E>,
    ) {
        this.latestSupportNode = hub.currentNode;
    }

    public nextElement(step: number): E | undefined {
        if (step <= 0 || !this.latestSupportNode) {
            return undefined;
        }
        let element: E | undefined;
        for (let i = 0; i < step; i ++) {
            this.latestSupportNode = this.hub.catchNext(this.latestSupportNode);
            if (!this.latestSupportNode) {
                return undefined;
            }
            element = this.latestSupportNode.element;
            this.count++;
        }
        return element;
    }

    public isEndless(): boolean {
        return this.chain.isEndless();
    }

    public didReadElementsCount(): number {
        return this.count;
    }
}

export class ForkDistributor<E> implements NodeHubResource {

    private readonly hubMap: {[name: string]: NodeHub<E> | undefined} = {};

    public constructor(
        public readonly chain: Chain<E>,
        private readonly classify: (element: E) => string,
    ) { }

    public static setChainMap<E>(chain: Chain<E>, classify: (element: E) => string, chainMap: {[name: string]: Chain<E>}): void {
        const distributor = new ForkDistributor<E>(chain, classify);
        for (const name in chainMap) {
            const hub = new NodeHub<E>(distributor);
            chainMap[name] = new ChainFromHub<E>(
                chain, hub,
            );
            distributor.hubMap[name] = hub;
        }
    }

    public prepareMoreElements(): boolean {
        const element = this.chain.nextElement(1);
        if (element === undefined) {
            return false;
        }
        const name = this.classify(element);
        const hub = this.hubMap[name];
        if (hub) {
            hub.pushElement(element);
        }
        return true;
    }
}