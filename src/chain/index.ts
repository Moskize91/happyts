/**
 * Created by taozeyu on 2017/2/7.
 */

import * as d from "./chain";
import {ChainContainer} from "./chain_container";

export {SplitResult} from "./chain";

export type Element<O extends Object> = null | number | string | O | Function;
export type ExtractType<O extends Object, E extends Element<O>> = {[key: string]: E};
export type ElementType<O extends Object, E extends Element<O>> = null | ReadonlyArray<E> | (() => E | undefined);

function isArray<O extends Object, E extends Element<O>>(array: ElementType<O, E>): array is ReadonlyArray<E> {
    return typeof array === "object" && array instanceof Array;
}

function isFunction<O extends Object, E extends Element<O>>(func: ElementType<O, E>): func is () => E | undefined {
    return typeof func === "function" && func instanceof Function;
}

export function chain<O extends Object, E extends Element<O>>(resource?: ElementType<O, E>): ChainContainer<E> {
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

export function extract<O extends Object, E extends Element<O>>(object: ExtractType<O, E>): ChainContainer<ExtractType<O, E>> {
    if (typeof object !== "object") {
        throw new Error(`you can only extract a object.`);
    }
    return new ChainContainer(new d.ObjectChain(object));
}

export function resolve(str: string): ChainContainer<string> {
    if (typeof str !== "string") {
        throw new Error(`you can only resolve a string.`);
    }
    return new ChainContainer<string>(new d.StringChain(str));
}

export function random(): ChainContainer<number> {
    return new ChainContainer<number>(new d.GeneratorChain(() => Math.random()));
}

export function constant<E>(constant: E): ChainContainer<E> {
    return new ChainContainer<E>(new d.GeneratorChain(() => constant));
}