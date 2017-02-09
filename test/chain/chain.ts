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
    });

});