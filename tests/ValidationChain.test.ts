import { body, validationResults } from "../src";
import { ParamLocation } from "../src/lib/types";
import ValidationChain from "../src/lib/ValidationChain";
import { mockContext } from "./helpers";

/**
 * Mock next function
 */
const next = async () => {
    // no-op
};

const prop = "property";

/**
 * ValidationChain
 */
describe("ValidationChain", () => {
    describe("constructor()", () => {
        test("Constructs without exceptions", () => {
            expect(() => {
                new ValidationChain("param", ParamLocation.BODY);
            }).not.toThrow();
        });

        test("Throws a TypeError with invalid parameters", () => {
            expect(() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const location: any = "invalid";
                new ValidationChain("param", location);
            }).toThrow(TypeError);
        });
    });

    describe("Chaining", () => {
        test("Stores validations", async () => {
            const validationChain = body("param").contains("seed").equals("foo");

            const ctx = mockContext();
            await validationChain(ctx, next);
            const results = validationResults(ctx);
            expect(results.hasErrors()).toBe(true);
            expect(results.array().length).toBe(2);
            expect(Object.keys(results.mapped()).length).toBe(1);
        });

        test("Combines previous chain results", async () => {
            const validationChain = body("param").contains("seed").equals("foo");
            const validationChain2 = body("param2").isInt();

            const ctx = mockContext();
            await validationChain(ctx, next);
            await validationChain2(ctx, next);
            const results = validationResults(ctx);
            expect(results.hasErrors()).toBe(true);
            expect(Object.keys(results.mapped()).length).toBe(2);
            expect(results.array().length).toBe(3);
        });

        test("Runs sanitizers only if validators have been passed", async () => {
            const valid = "2019-01-01";
            const invalid = "2019-20-20";

            const validationChain = body(prop).isISO8601().toDate();

            const ctxInvalid = mockContext(ParamLocation.BODY, { [prop]: invalid });
            const ctxValid = mockContext(ParamLocation.BODY, { [prop]: valid });

            await validationChain(ctxInvalid, next);

            let results = validationResults(ctxInvalid);

            expect(results.hasErrors()).toBe(true);
            expect(Object.keys(results.passedData()).length).toBe(0);

            await validationChain(ctxValid, next);

            results = validationResults(ctxValid);

            expect(results.hasErrors()).toBe(false);
            expect(Object.keys(results.passedData()).length).toBe(1);
            expect(results.passedData()[prop]).toBeInstanceOf(Date);
        });

        test("Throws if used more than one sanitizer", async () => {
            expect(() => body(prop).toBoolean().toDate()).toThrow(Error);
        });

        test("Handles nested properties as well", async () => {
            const validationChain = body("nested.prop").contains("seed");

            const ctx = mockContext(ParamLocation.BODY, {
                nested: { prop: "sesame seed" },
            });
            await validationChain(ctx, next);
            const results = validationResults(ctx);
            expect(results.hasErrors()).toBe(false);
            expect(results.array().length).toBe(0);

            const failCtx = mockContext(ParamLocation.BODY, {});
            await validationChain(failCtx, next);
            const failResults = validationResults(failCtx);
            expect(failResults.hasErrors()).toBe(true);
            expect(failResults.array().length).toBe(1);
        });
    });
});
