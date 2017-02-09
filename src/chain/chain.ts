/**
 * Created by taozeyu on 2017/2/8.
 */

export interface Chain<E> {
    nextElement(step: number): E | undefined;
    isEndless(): boolean;
    didReadElementsCount(): number;
}

function chainToArray<E>(chain: Chain<E>): E[] {
    const array: E[] = [];
    let element: E | undefined;
    while ((element = chain.nextElement(1)) !== undefined) {
        array.push(element);
    }
    return array;
}

export class EmptyChain<E> implements Chain<E> {

    public nextElement(step: number): E | undefined {
        return undefined;
    }

    public isEndless(): boolean {
        return false;
    }

    public didReadElementsCount(): number {
        return 0;
    }
}

export class ArrayChain<E> implements Chain<E> {

    private nextIndex: number = -1;

    public constructor(
        private readonly array: ReadonlyArray<E>,
    ) {}

    public nextElement(step: number): E | undefined {
        if (step <= 0) {
            return undefined;
        }
        this.nextIndex = Math.min(this.nextIndex + step, this.array.length);
        return this.array[this.nextIndex];
    }

    public isEndless(): boolean {
        return false;
    }

    public didReadElementsCount(): number {
        return this.nextIndex;
    }
}

export class ObjectChain<E> extends ArrayChain<{[key: string]: E}> {

    public constructor(object: {[key: string]: E}) {
        super(ObjectChain.resolve(object));
    }

    private static resolve<E>(object: {[key: string]: E}): {[key: string]: E}[] {
        const array: {[key: string]: E}[] = [];
        for (const key in object) {
            const element: {[key: string]: E} = {};
            element[key] = object[key];
            array.push(element);
        }
        return array;
    }
}

export class StringChain implements Chain<string> {

    private nextIndex: number = -1;
    private readonly strObj: String;

    public constructor(str: string) {
        this.strObj = new String(str);
    }

    public nextElement(step: number): string | undefined {
        if (step <= 0) {
            return undefined;
        }
        this.nextIndex = Math.min(this.nextIndex + step, this.strObj.length);
        return this.strObj[this.nextIndex];
    }

    public isEndless(): boolean {
        return false;
    }

    public didReadElementsCount(): number {
        return this.strObj.length;
    }
}

export class GeneratorChain<E> implements Chain<E> {

    private count: number = 0;

    public constructor(
        private readonly generator: () => E | undefined,
    ) {}

    public nextElement(step: number): E | undefined {
        let element: E | undefined;
        for (let i = 0; i < step; ++i) {
            element = this.generator();
            if (element === undefined) {
                return element;
            }
            this.count++;
        }
        return element;
    }

    public isEndless(): boolean {
        return true;
    }

    public didReadElementsCount(): number {
        return this.count;
    }
}

export class Filter<E> implements Chain<E> {

    private count: number = 0;

    public constructor(
        private readonly chain: Chain<E>,
        private readonly filter: (element: E, index: number) => boolean,
    ) {}

    public nextElement(step: number): E | undefined {
        let element: E | undefined;
        for (let i: number = 0; i < step; ++i) {
            while ((element = this.chain.nextElement(1)) !== undefined && !this.filter(element, this.chain.didReadElementsCount() - 1)) {}
            if (element === undefined) {
                return undefined;
            }
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

export class Map<E, OE> implements Chain<E> {

    public constructor(
        private readonly chain: Chain<OE>,
        private readonly map: (element: OE, index: number) => E,
    ) {}

    public nextElement(step: number): E | undefined {
        const element = this.chain.nextElement(step);
        if (element === undefined) {
            return undefined;
        }
        return this.map(element, this.chain.didReadElementsCount() - 1);
    }

    public isEndless(): boolean {
        return this.chain.isEndless();
    }

    public didReadElementsCount(): number {
        return this.chain.didReadElementsCount();
    }
}

export class Each<E> implements Chain<E> {

    public constructor(
        private readonly chain: Chain<E>,
        private readonly each: (element: E, index: number) => void,
    ) {}

    public nextElement(step: number): E | undefined {
        const element = this.chain.nextElement(step);
        if (element === undefined) {
            return undefined;
        }
        this.each(element, this.chain.didReadElementsCount() - 1);
        return element;
    }

    public isEndless(): boolean {
        return this.chain.isEndless();
    }

    public didReadElementsCount(): number {
        return this.chain.didReadElementsCount();
    }
}

export class Skip<E> implements Chain<E> {

    private skipCount: number = 0;
    private completeSkiping: boolean = false;

    public constructor(
        private readonly chain: Chain<E>,
        private readonly skip: (element: E, index: number) => boolean,
    ) {}

    public nextElement(step: number): E | undefined {
        let element: E | undefined;
        if (!this.completeSkiping) {
            while ((element = this.chain.nextElement(1)) !== undefined) {
                if (!this.skip(element, this.chain.didReadElementsCount() - 1)) {
                    break;
                }
                this.skipCount++;
            }
            this.completeSkiping = true;
            if (element !== undefined) {
                step--;
            }
        }
        if (step > 0) {
            element = this.chain.nextElement(step);
        }
        return element;
    }

    public isEndless(): boolean {
        return this.chain.isEndless();
    }

    public didReadElementsCount(): number {
        return this.chain.didReadElementsCount() - this.skipCount;
    }
}

export class Reverse<E> extends ArrayChain<E> {

    public constructor(chain: Chain<E>) {
        super(Reverse.reverse(chain));
    }

    private static reverse<E>(chain: Chain<E>): E[] {
        if (chain.isEndless()) {
            throw new Error(`can't reverse a endless chain.`);
        }
        const array: E[] = chainToArray(chain);
        const results: E[] = [];
        for (let i: number = 0; i < array.length; ++i) {
            results[array.length - i - 1] = array[i];
        }
        return results;
    }
}

export class Linker<E0, E1> implements Chain<E0 | E1> {

    public constructor(
        private readonly chain0: Chain<E0>,
        private readonly chain1: Chain<E1>,
    ) {}

    public nextElement(step: number): E0 | E1 | undefined {
        let element: E0 | E1 | undefined;
        const originalChain0Count = this.chain0.didReadElementsCount();
        element = this.chain0.nextElement(step);
        step -= this.chain0.didReadElementsCount() - originalChain0Count;
        if (step > 0) {
            element = this.chain1.nextElement(step);
        }
        return element;
    }

    public isEndless(): boolean {
        return this.chain0.isEndless() && this.chain1.isEndless();
    }

    public didReadElementsCount(): number {
        return this.chain0.didReadElementsCount() + this.chain1.didReadElementsCount();
    }
}

// TODO Fork

// TODO Merge

export enum SplitResult {
    Continue,
    SplitBefore,
    SplitBeforeAndIncludeThis,
    SplitBeforeAndDeleteThis,
}

export class Spliter<E> implements Chain<Chain<E>> {

    private count: number = 0;
    private cachedElement?: E;

    public constructor(
        private readonly chain: Chain<E>,
        private readonly spliter: (element: E, index: number, didHandledCount: number) => SplitResult,
    ) {}

    private nextElementAndGenerateIfNotBuilt(): Chain<E> | undefined {
        const elements: E[] = [];
        let index: number = 0;
        if (this.cachedElement !== undefined) {
            elements.push(this.cachedElement);
            index++;
            this.cachedElement = undefined;
        }
        main_loop: while (true) {
            const element = this.chain.nextElement(1);
            if (element === undefined) {
                break;
            }
            const splitResult = this.spliter(element, index, this.chain.didReadElementsCount());
            switch (splitResult) {
                case SplitResult.Continue:
                    elements.push(element);
                    break;

                case SplitResult.SplitBefore:
                    this.cachedElement = element;
                    break main_loop;

                case SplitResult.SplitBeforeAndIncludeThis:
                    elements.push(element);
                    break main_loop;

                case SplitResult.SplitBeforeAndDeleteThis:
                    break main_loop;

                default:
                    throw new Error(`unrecognized split result '${splitResult}'`);
            }
            index++;
        }
        if (elements.length === 0) {
            return undefined;
        }
        return new ArrayChain(elements);
    }

    public nextElement(step: number): Chain<E> | undefined {
        let element: Chain<E> | undefined;
        for (let i: number = 0; i < step; ++i) {
            while ((element = this.nextElementAndGenerateIfNotBuilt()) === undefined && this.cachedElement !== undefined) {};
            if (element === undefined) {
                return undefined;
            }
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