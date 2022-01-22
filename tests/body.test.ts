import { body } from "../src";

describe("body()", () => {
    test("Returns a new ValidationChain", () => {
        const chain = body("prop");
        expect(chain).toBeInstanceOf(Function);
    });
});
