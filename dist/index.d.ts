import { RouterContext } from "@koa/router";
import ValidationChain from "./lib/ValidationChain";
import ValidationResult from "./lib/ValidationResult";
/**
 * Get validation results out of the context.
 *
 * @param ctx The request context
 *
 * @example
 * // In request controller
 * const errors = validationResults(ctx);
 * if (errors.hasErrors()) {
 *     throw new RequestError(422, errors.mapped());
 * }
 */
export declare const validationResults: (ctx: RouterContext) => ValidationResult;
/**
 * Validate request body.
 *
 * @param bodyParam The parameter to be validated from request.
 *
 * ```typescript
 * router.post(
 *     '/auth/login',
 *     body('username').equals('user').build(),
 *     body('password').equals('pass').build(),
 *     handler
 * );
 * ```
 */
export declare const body: (bodyParam: string) => ValidationChain;
/**
 * Validate request query.
 *
 * @param queryString The parameter to be validated from request.
 *
 * ```typescript
 * router.get(
 *     '/api/tags',
 *     query('search').contains('_').build(),
 *     handler
 * );
 * ```
 */
export declare const query: (queryString: string) => ValidationChain;
/**
 * Validate request param.
 *
 * @param routeParam The parameter to be validated from request.
 *
 * ```typescript
 * router.get(
 *     '/api/users/:id',
 *     param('id').isInt().build(),
 *     handler
 * );
 * ```
 */
export declare const param: (routeParam: string) => ValidationChain;
export * from "./lib/types";
export * as ValidationChain from "./lib/ValidationChain";
export * as ValidationResult from "./lib/ValidationResult";
