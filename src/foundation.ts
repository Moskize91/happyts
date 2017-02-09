/**
 * Created by taozeyu on 2017/2/7.
 */

export type ReadOnly<T> = {
    readonly [P in keyof T]: T[P];
};

export function immutable<T>(target: T): ReadOnly<T> {
    if (typeof target !== "object") {
        return target;
    }
    if (target.constructor !== Object && target.constructor !== Function) {
        throw new Error(`could only make a plaint pure object readonly. but the object'type is ${target.constructor}`);
    }
    for (const key in target) {
        if (!Object.getOwnPropertyDescriptor(target, key).writable) {
            Object.defineProperty(target, key, {
                writable: false,
                enumerable: true,
                configurable: true,
            });
            immutable(target[key]);
        }
    }
    return target;
}