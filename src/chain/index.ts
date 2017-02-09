/**
 * Created by taozeyu on 2017/2/7.
 */

import * as chain from "./chain";
import {ChainContainer} from "./chain_container";

export type ElementType<T extends Object> = null | T | number | string;

function isArray<E>(array: ElementType<E>[] | ElementType<E> | (() => ElementType<E> | undefined)): array is ElementType<E>[] {
    return typeof array === "object" && array instanceof Array;
}

function isFunction<E>(func: ElementType<E>[] | ElementType<E> | (() => ElementType<E> | undefined)): func is (() => ElementType<E> | undefined) {
    return typeof func === "function" && func instanceof Function;
}

function stringToArray(str: string): string[] {
    const array: string[] = [];
    const strObj: String = new String(str);
    for (let i = 0; i < strObj.length; ++i) {
        array[i] = strObj[i];
    }
    return array;
}

export function createChain<E extends Object>(resource?: ElementType<E>[] | ElementType<E> | (() => ElementType<E> | undefined)): ChainContainer<ElementType<E>> {
    if (resource === undefined || resource === null) {
        return new ChainContainer(new chain.EmptyChain<ElementType<E>>());

    } else if (typeof resource === "string") {
        return new ChainContainer(new chain.ArrayChain<ElementType<E>>(stringToArray(resource)));

    } else if (isArray(resource)) {
        return new ChainContainer(new chain.ArrayChain(resource));

    } else if (isFunction(resource)) {
        return new ChainContainer(new chain.GeneratorChain<ElementType<E>>(resource));

    } else {
        return new ChainContainer(new chain.ArrayChain([resource]));
    }
}