/**
 * Created by taozeyu on 2017/2/9.
 */

import { assert, expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as _ from "../../src/index";

use(chaiAsPromised);

describe("Chain", () => {

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
});