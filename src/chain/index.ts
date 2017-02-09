/**
 * Created by taozeyu on 2017/2/7.
 */

import * as d from "./chain";
import {ChainContainer} from "./chain_container";

export type Element<T> = null | number | string | Object | Function;
export type ResolveType<T extends Element<T>> = null | string | {[key: string]: T};
export type ElementType<T extends Element<T>> = null | ReadonlyArray<T> | (() => T | undefined);

function isArray<E extends Element<E>>(array: ElementType<E>): array is ReadonlyArray<E> {
    return typeof array === "object" && array instanceof Array;
}

function isFunction<E extends Element<E>>(func: ElementType<E>): func is () => E | undefined {
    return typeof func === "function" && func instanceof Function;
}

function isString<E extends Element<E>>(str: ResolveType<E>): str is string {
    return typeof str === "string";
}

function stringToArray(str: string): string[] {
    const array: string[] = [];
    const strObj: String = new String(str);
    for (let i = 0; i < strObj.length; ++i) {
        array[i] = strObj[i];
    }
    return array;
}

export function chain<E extends Element<E>>(resource?: ElementType<E>): ChainContainer<E> {
    if (resource === undefined || resource === null) {
        return new ChainContainer(new d.EmptyChain<E>());

    } else if (isArray(resource)) {
        return new ChainContainer(new d.ArrayChain<E>(resource));

    } else if (isFunction(resource)) {
        return new ChainContainer(new d.GeneratorChain<E>(resource));

    } else {
        throw new Error(`unrecognized resource type. resource type must be array or null or undefined or function() {return ...;}`);
    }
}

export function resolve<E extends Element<E>>(resource?: ResolveType<E>): ChainContainer<ResolveType<E>> {
    if (resource === undefined || resource === null) {
        return new ChainContainer(new d.EmptyChain<ResolveType<E>>());

    } else if (isString(resource)) {
        return new ChainContainer(new d.ArrayChain<string>(stringToArray(resource)));

    } else if (typeof resource === "object") {
        return new ChainContainer(new d.ObjectChain(resource));

    } else {
        throw new Error(`unrecognized resource type. resource type must be string or object or null or undefined.`);
    }
}