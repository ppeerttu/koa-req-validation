import { param } from "../src";
import ValidationChain from "../src/lib/ValidationChain";

describe("param()", () => {
    test("Returns a new ValidationChain", () => {
        const chain = param("prop");
        expect(chain).toBeInstanceOf(ValidationChain);
    });
});
