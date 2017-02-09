/**
 * Created by taozeyu on 2017/2/8.
 */

import * as chain from "./chain";
import {SplitResult} from "./chain";

export class ChainContainer<E> {

    public constructor(
        public readonly chain: chain.Chain<E>,
    ) {}

    public done(each?: (element: E, index: number) => void): void {
        if (this.chain.isEndless()) {
            throw new Error("Endless chain couldn't be done.");
        }
        let element: E | undefined;
        while ((element = this.chain.nextElement(1)) !== undefined) {
            if (each) {
                each(element, this.chain.didReadElementsCount() - 1);
            }
        }
    }

    public first(): E | undefined {
        return this.chain.nextElement(1);
    }

    public last(): E | undefined {
        if (this.chain.isEndless()) {
            throw new Error("Endless chain doesn't have last element.");
        }
        let last: E | undefined;
        let next: E | undefined;
        while ((next = this.chain.nextElement(1)) !== undefined) {
            last = next;
        }
        return last;
    }

    public elementAt(index: number): E | undefined {
        return this.chain.nextElement(index + 1);
    }

    public array(array?: E[] | number, count?: number): E[] {
        if (typeof array === "number") {
            count = array;
            array = [];
        } else if (array === undefined) {
            array = [];
        }
        if (this.chain.isEndless() && count === undefined) {
            throw new Error("Endless chain couldn't convert to array.");
        }
        let element: E | undefined;
        while (
            (count === undefined || count > 0) &&
            (element = this.chain.nextElement(1)) !== undefined
        ) {
            array.push(element);
            if (count !== undefined) {
                count--;
            }
        }
        return array;
    }

    public fold<T>(initValue: T, folder: (value: T, element: E) => T): T {
        let value = initValue;
        let element: E | undefined;
        while ((element = this.chain.nextElement(1)) !== undefined) {
            value = folder(value, element);
        }
        return value;
    }

    public filter(filter: (element: E, index: number) => boolean): ChainContainer<E> {
        return new ChainContainer(new chain.Filter(this.chain, filter));
    }

    public map<T>(map: (element: E, index: number) => T): ChainContainer<T> {
        return new ChainContainer(new chain.Map(this.chain, map));
    }

    public reverse(): ChainContainer<E> {
        return new ChainContainer(new chain.Reverse(this.chain));
    }

    public split(spliter: (element: E, index: number, didHandledCount: number) => SplitResult): ChainContainer<ChainContainer<E>> {
        const splitChain = new chain.Spliter(this.chain, spliter);
        return new ChainContainer(new chain.Map(splitChain, chain => new ChainContainer(chain)));
    }

    public link<T>(chainContainer: ChainContainer<T>): ChainContainer<E | T> {
        return new ChainContainer<E | T>(new chain.Linker(this.chain, chainContainer.chain));
    }

    public linkTo<T>(chainContainer: ChainContainer<T>): ChainContainer<E | T> {
        return new ChainContainer<E | T>(new chain.Linker(chainContainer.chain, this.chain));
    }

    public skip(numOrCondition: number | ((element: E) => boolean), each?: ((element: E) => void)): ChainContainer<E> {
        if (typeof numOrCondition === "number") {
            let num = numOrCondition;
            return new ChainContainer(new chain.Skip(this.chain, element => {
                if (each) {
                    each(element);
                }
                num--;
                return num > 0;
            }));
        } else {
            const condition = numOrCondition;
            return new ChainContainer(new chain.Skip(this.chain, condition));
        }
    }

    public skipTo(target: E, each?: ((element: E) => void)): ChainContainer<E> {
        return new ChainContainer(new chain.Skip(this.chain, element => {
            if (each && element !== target) {
                each(element);
            }
            return element !== target;
        }));
    }
}
