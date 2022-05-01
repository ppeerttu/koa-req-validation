import { RouterContext } from "@koa/router";
import { ParamLocation } from "../../src/lib/types";

/**
 * Mocked Koa request context for testing.
 *
 * @param location Location of the properties object
 * @param properties Request properties
 *
 * @example
 * // Constructing the mock context for mocked request containing
 * // request body with username and password
 * const ctx = mockContext(ParamLocation.BODY, { foo: 'foo', bar: 'bar' });
 * // Later in code extracting the body parameters from the request
 * const { foo, bar } = ctx.request.body;
 */
export function mockContext<
    T = unknown,
    S extends Record<string, unknown> = Record<string, unknown>
>(location?: ParamLocation, payload?: T, state?: S) {
    const ctx = {
        request: {
            body: {},
        },
        query: {},
        params: {},
        state: state ?? {},
    };
    if (payload) {
        switch (location) {
            case ParamLocation.BODY:
                ctx.request.body = payload;
                break;
            case ParamLocation.PARAM:
                ctx.params = payload;
                break;
            case ParamLocation.QUERY:
                ctx.query = payload;
                break;
        }
    }
    return ctx as RouterContext;
}
