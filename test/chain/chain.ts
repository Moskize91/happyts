/**
 * Created by taozeyu on 2017/2/9.
 */

import { assert, expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as _ from "../../src/index";

use(chaiAsPromised);

describe("Chain", () => {

    it("pick up elements", () => {
        _.chain([1, 2, 3, 4]);
        _.resolve();
        expect(123).to.equal(123);
    });

});