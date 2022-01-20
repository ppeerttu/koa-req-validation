import { query, validationResults } from "../src";
import { ParamLocation } from "../src/lib/types";
import { mockContext } from "./helpers";

/**
 * Mock next function
 */
const next = async () => {
    // no-op
};

const prop = "property";

/**
 * ValidatorChain sanitizer functions
 */
describe("ValidatorChain sanitizers", () => {
    test("blacklist()", async () => {
        const chars = "l ";
        const value = "hello world";

        const validationChain = query(prop).blacklist(chars);
        const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
        await validationChain(ctx, next);

        const results = validationResults(ctx);
        expect(results.mapped()).not.toHaveProperty(prop);

        const passedData = results.passedData();
        expect(passedData[prop]).toEqual("heoword");
    });

    test("whitelist()", async () => {
        const chars = "l ";
        const value = "hello world";

        const validationChain = query(prop).whitelist(chars);
        const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
        await validationChain(ctx, next);

        const results = validationResults(ctx);
        expect(results.mapped()).not.toHaveProperty(prop);

        const passedData = results.passedData();
        expect(passedData[prop]).toEqual("ll l");
    });

    test("escape()", async () => {
        const value = "<p>Hello world</p>";

        const validationChain = query(prop).escape();
        const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
        await validationChain(ctx, next);

        const results = validationResults(ctx);
        expect(results.mapped()).not.toHaveProperty(prop);

        const passedData = results.passedData();
        expect(passedData[prop]).toEqual("&lt;p&gt;Hello world&lt;&#x2F;p&gt;");
    });

    test("unescape()", async () => {
        const value = "&lt;p&gt;Hello world&lt;&#x2F;p&gt;";

        const validationChain = query(prop).unescape();
        const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
        await validationChain(ctx, next);

        const results = validationResults(ctx);
        expect(results.mapped()).not.toHaveProperty(prop);

        const passedData = results.passedData();
        expect(passedData[prop]).toEqual("<p>Hello world</p>");
    });

    test("ltrim()", async () => {
        const value = "//hello world";

        const validationChain = query(prop).ltrim("/");
        const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
        await validationChain(ctx, next);

        const results = validationResults(ctx);
        expect(results.mapped()).not.toHaveProperty(prop);

        const passedData = results.passedData();
        expect(passedData[prop]).toEqual("hello world");
    });

    test("rtrim()", async () => {
        const value = "hello world//";

        const validationChain = query(prop).rtrim("/");
        const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
        await validationChain(ctx, next);

        const results = validationResults(ctx);
        expect(results.mapped()).not.toHaveProperty(prop);

        const passedData = results.passedData();
        expect(passedData[prop]).toEqual("hello world");
    });

    test("trim()", async () => {
        const value = "  hello world  ";

        const validationChain = query(prop).trim();
        const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
        await validationChain(ctx, next);

        const results = validationResults(ctx);
        expect(results.mapped()).not.toHaveProperty(prop);

        const passedData = results.passedData();
        expect(passedData[prop]).toEqual("hello world");
    });

    test("normalizeEmail()", async () => {
        const value = "Hello@world.com";

        const validationChain = query(prop).normalizeEmail({ all_lowercase: true });
        const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
        await validationChain(ctx, next);

        const results = validationResults(ctx);
        expect(results.mapped()).not.toHaveProperty(prop);

        const passedData = results.passedData();
        expect(passedData[prop]).toEqual("hello@world.com");
    });

    test("toBoolean()", async () => {
        const value = "true";

        const validationChain = query(prop).toBoolean();
        const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
        await validationChain(ctx, next);

        const results = validationResults(ctx);
        expect(results.mapped()).not.toHaveProperty(prop);

        const passedData = results.passedData();
        expect(passedData[prop]).toEqual(true);
    });

    test("toDate()", async () => {
        const value = "2019-01-01T00:00:00Z";

        const validationChain = query(prop).toDate();
        const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
        await validationChain(ctx, next);

        const results = validationResults(ctx);
        expect(results.mapped()).not.toHaveProperty(prop);

        const passedData = results.passedData();
        expect(passedData[prop]).toBeInstanceOf(Date);
    });

    test("toFloat()", async () => {
        const value = "0.29920390";

        const validationChain = query(prop).toFloat();
        const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
        await validationChain(ctx, next);

        const results = validationResults(ctx);
        expect(results.mapped()).not.toHaveProperty(prop);

        const passedData = results.passedData();
        expect(passedData[prop]).toBeCloseTo(0.299);
    });

    test("toInt()", async () => {
        const value = "3.29920390";

        const validationChain = query(prop).toInt();
        const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
        await validationChain(ctx, next);

        const results = validationResults(ctx);
        expect(results.mapped()).not.toHaveProperty(prop);

        const passedData = results.passedData();
        expect(passedData[prop]).toBe(3);
    });

    test("stripLow()", async () => {
        const value = `Hello
 World`;

        const validationChain = query(prop).stripLow();
        const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
        await validationChain(ctx, next);

        const results = validationResults(ctx);
        expect(results.mapped()).not.toHaveProperty(prop);

        const passedData = results.passedData();
        expect(passedData[prop]).toEqual("Hello World");
    });
});
