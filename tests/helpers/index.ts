import { ParamLocation } from '../../src/lib/types';

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
export function mockContext(location?: ParamLocation, properties?: {}): any {
    const ctx = {
        request: {
            body: {},
        },
        query: {},
        params: {},
        state: {},
    };
    if (properties) {
        switch (location) {
            case ParamLocation.BODY:
                ctx.request.body = properties;
                break;
            case ParamLocation.PARAM:
                ctx.params = properties;
                break;
            case ParamLocation.QUERY:
                ctx.query = properties;
                break;
        }
    }
    return ctx;
}
