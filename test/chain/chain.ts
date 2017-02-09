/**
 * Created by taozeyu on 2017/2/9.
 */

import { assert, expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
use(chaiAsPromised);

describe("TestDemo", () => {
    describe("test 001", () => {
        it("abc", () => {
            expect(123).to.equal(123);
        });
    });
});