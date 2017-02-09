/**
 * Created by taozeyu on 2017/2/9.
 */

import { assert, expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as _ from "../../src/index";

use(chaiAsPromised);

describe("Build chain and pick up them", () => {

    it("pick up elements", () => {
        expect(_.chain([1, 2, 3, "a", "b"]).first()).to.equal(1);
        expect(_.chain([1, 2, 3, "a", "b"]).last()).to.equal("b");
        expect(_.chain([1, 2, 3, "a", "b"]).elementAt(2)).to.equal(3);
        expect(_.chain([1, 2, 3, "a", "b"]).elementAt(3)).to.equal("a");
        expect(_.chain([1, 2, 3, "a", "b"]).elementAt(-100)).to.equal(undefined);
        expect(_.chain([1, 2, 3, "a", "b"]).elementAt(5)).to.equal(undefined);
    });

    it("pick up string elements", () => {
        expect(_.resolve("hello world!").first()).to.equal("h");
        expect(_.resolve("hello world!").last()).to.equal("!");
        expect(_.resolve("hello world!").elementAt(5)).to.equal(" ");
        expect(_.resolve("hello world!").elementAt(7)).to.equal("o");
        expect(_.resolve("hello world!").elementAt(-100)).to.equal(undefined);
        expect(_.resolve("hello world!").elementAt(12)).to.equal(undefined);
    });

    it("pick up extracted object elements", () => {
        let array: {[key: string]: number | string}[] = [];
        _.extract({a: 1, b: 2, c: "c", d: "d"}).array(array);
        array = array.sort((o1, o2) => {
            let key1: string = "";
            let key2: string = "";
            for (const k in o1) {
                key1 = k;
            };
            for (const k in o2) {
                key2 = k;
            };
            if (key1 > key2) {
                return +1;
            } else if (key1 < key2) {
                return -1;
            } else {
                return 0;
            }
        });
        expect(array).deep.equal([{a: 1}, {b: 2}, {c: "c"}, {d: "d"}]);
    });

    it("pick element returned by function", () => {
        let index = 0;
        expect(_.chain(() => `ts${index++}`).array([], 5)).deep.equal([
            "ts0", "ts1", "ts2", "ts3", "ts4",
        ]);
        expect(_.chain(() => `sp${index++}`).array([], 3)).deep.equal([
            "sp5", "sp6", "sp7",
        ]);
        expect(() => _.chain(() => `fn${index++}`).array([])).to.throw(Error);
        expect(() => _.chain(() => `fn${index++}`).array()).to.throw(Error);
    });
});