import { query } from "../src";

describe("query()", () => {
    test("Returns a new ValidationChain", () => {
        const chain = query("prop");
        expect(chain).toBeInstanceOf(Function);
    });
});
