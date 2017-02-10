/**
 * Created by taozeyu on 2017/2/9.
 */

import {expect, use} from "chai";
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
        expect(() => _.chain(() => `fn${index++}`).last()).to.throw(Error);
    });
});

describe("Chain links methods: filter, map, reverse, each etc.", () => {

    it("filter", () => {
        expect(_.chain([1, 2, 3, 4, 5, 6, 7, 8]).filter(num => num % 2 === 0).array()).deep.equal([
            2, 4, 6, 8,
        ]);
    });

    it("map", () => {
        expect(_.chain([1, 2, 3, 4]).map(s => `abc[${s}]`).array()).deep.equal([
            "abc[1]", "abc[2]", "abc[3]", "abc[4]",
        ]);
    });

    it("reverse", () => {
        expect(_.chain([1, 2, 3, 4]).reverse().array()).deep.equal([
            4, 3, 2, 1,
        ]);
    });

    it("sort", () => {
        expect(_.chain(["1", "4", "3", "5", "2"]).sort().array()).deep.equal([
            "1", "2", "3", "4", "5",
        ]);
        expect(_.chain([7, 3, 6, 1, 3, 6, 4, 2]).sort((n1, n2) => n2 - n1).array()).deep.equal([
            7, 6, 6, 4, 3, 3, 2, 1,
        ]);
    });

    it("each", () => {
        const array: string[] = [];
        const chain = _.chain(["a", "b", "c", "d"]).each(s => array.push(s));
        expect(array).deep.equal([]);
        chain.done();
        expect(array).deep.equal(["a", "b", "c", "d"]);
    });
});

describe("Multi-chain", () => {

    it("connect", () => {
        expect(
            _.chain([1, 3, 5, 2]).connect(_.chain([999, 666, 888])).array(),
        ).deep.equal([
            1, 3, 5, 2, 999, 666, 888,
        ]);
        expect(
            _.chain([1, 3, 5, 2]).connectTo(_.chain([999, 666, 888])).array(),
        ).deep.equal([
            999, 666, 888, 1, 3, 5, 2,
        ]);
    });

    it("merge", () => {
        expect(
            _.chain([1, 3, 7, 10, 15, 666])
                .merge(_.chain(["a", "b", "c", "d"]), (num, str) => `${num}-${str}`)
                .array(),
        ).deep.equal(["1-a", "3-b", "7-c", "10-d"]);
        expect(
            _.chain([1, 3, 7, 10, 15, 666])
                .mergeTo(_.chain(["a", "b", "c", "d"]), (str, num) => `${num}-${str}`)
                .array(),
        ).deep.equal(["1-a", "3-b", "7-c", "10-d"]);
    });

    it("fork", () => {
        const results = _.chain([
            1, 2, 3, 4, 5, 6, 7
        ]).fork(["left", "right"], num => (num % 2 === 0 ? "left" : "right"));

        expect(results["left"].array()).deep.equal([2, 4, 6]);
        expect(results["right"].array()).deep.equal([1, 3, 5, 7]);

        expect(() => (_.chain([1]).fork(["f"], () => "d")["f"].done())).to.throw(Error);
    });

    it("fork is lazy loadings", () => {
        const array: any[] = [];
        const results = _.chain([
            "a", "b", "c", 1, 2, "d", "e", 3, 4, 5,
        ])
            .each(e => array.push(e))
            .fork(["abc", "num"], e => (typeof e === "string" ? "abc" : "num"));

        const {abc, num} = results;

        array.push("step 1");
        expect(abc.first()).to.equal("a");
        expect(abc.first()).to.equal("b");

        array.push("step 2");
        expect(num.first()).to.equal(1);

        array.push("step 3");
        expect(abc.first()).to.equal("c");
        expect(abc.first()).to.equal("d");

        array.push("step 4");
        expect(num.array()).deep.equal([2, 3, 4, 5]);
        array.push("step 5");
        expect(abc.array()).deep.equal(["e"]);

        expect(array).deep.equal([
            "step 1", "a", "b",
            "step 2", "c", 1,
            "step 3", 2, "d",
            "step 4", "e", 3, 4, 5,
            "step 5",
        ]);
    });
});

describe("Chain others", () => {

    it("fold", () => {
        expect(_.chain([2, 4, 1, 5]).fold(0, (n1, n2) => n1 + n2)).to.equal(2 + 4 + 1 + 5);
        expect(_.chain([2, 4, 1, 5]).fold<number[]>([], (arr, n) => [n, ...arr])).deep.equal([5, 1, 4, 2]);
    });

    it("skip", () => {
        let array: number[] = [];
        expect(_.chain([1, 3, 7, 9, 2, 3, 6, 10]).skip(5, num => array.push(num)).array()).deep.equal([
            3, 6, 10,
        ]);
        expect(array).deep.equal([1, 3, 7, 9, 2]);

        array = [];
        expect(_.chain([1, 3, 7, 9, 2, 3, 6, 10]).skip(num => num < 8, num => array.push(num)).array()).deep.equal([
            9, 2, 3, 6, 10,
        ]);
        expect(array).deep.equal([]);

        expect(_.chain([1, 3, 7, 9, 2, 3, 6, 10]).skip(2).skip(3).array()).deep.equal([
            3, 6, 10,
        ]);

        array = [];
        expect(_.chain([1, 3, 7, 9, 2, 3, 6, 10]).skipTo(7, num => array.push(num)).array()).deep.equal([
            7, 9, 2, 3, 6, 10,
        ]);
        expect(array).deep.equal([1, 3]);

        expect(_.chain([1, 3, 7, 9, 2, 3, 6, 10]).skipTo(7).skipTo(3).array()).deep.equal([
            3, 6, 10,
        ]);
        expect(_.chain([1, 3, 7, 9, 2, 3, 6, 10]).skip(666).skip(666).array()).deep.equal([]);
        expect(_.chain([1, 3, 7, 9, 2, 3, 6, 10]).skipTo(666).array()).deep.equal([]);
    });

    it("split", () => {
        expect(_.chain([1, 2, 3, "enter", 4, 5, "enter", 8, 9 , 666, 999])
                .split(e => (typeof e === "string" ?
                        _.SplitResult.SplitBeforeAndDeleteThis :
                        _.SplitResult.Continue))
                .map(c => c.array()).array(),
        ).deep.equal([[1, 2, 3], [4, 5], [8, 9, 666, 999]]);

        expect(_.chain([1, 2, 3, "enter", 4, 5, "enter", 8, 9 , 666, 999])
            .split(e => (typeof e === "string" ?
                _.SplitResult.SplitBeforeAndIncludeThis :
                _.SplitResult.Continue))
            .map(c => c.array()).array(),
        ).deep.equal([[1, 2, 3, "enter"], [4, 5, "enter"], [8, 9, 666, 999]]);

        expect(_.chain([1, 2, 3, "enter", 4, 5, "enter", 8, 9 , 666, 999])
            .split(e => (typeof e === "string" ?
                _.SplitResult.SplitBefore :
                _.SplitResult.Continue))
            .map(c => c.array()).array(),
        ).deep.equal([[1, 2, 3], ["enter", 4, 5], ["enter", 8, 9, 666, 999]]);

        expect(_.chain([1, 2, 3, "enter", 4, 5, "enter", 8, 9 , 666, 999])
            .split(() => _.SplitResult.Continue)
            .map(c => c.array()).array(),
        ).deep.equal([[1, 2, 3, "enter", 4, 5, "enter", 8, 9 , 666, 999]]);
    });

    it("many chain", () => {
        expect(
            _.chain([2, 4, 100006, 1, 2, 7, 12, 6, 666, -1000, 20000])
                .filter(n => n > 0)
                .filter(n => n < 100)
                .map(n => `good${n}`)
                .sort()
                .fold("start", (s1, s2) => `${s1} ${s2}`),
        ).to.equal("start good1 good12 good2 good2 good4 good6 good7");
    });
});