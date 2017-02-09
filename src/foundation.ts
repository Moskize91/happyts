/**
 * Created by taozeyu on 2017/2/7.
 */

export type ReadOnly<T> = {
    readonly [P in keyof T]: T[P];
};
