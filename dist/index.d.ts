import { RouterContext } from "@koa/router";
import { Validator } from "./lib/types";
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
 * @param field The parameter to be validated from request.
 *
 * ```typescript
 * router.post(
 *     '/auth/login',
 *     body('username').equals('user'),
 *     body('password').equals('pass'),
 *     handler
 * );
 * ```
 */
export declare const body: (field: string) => Validator;
/**
 * Validate request query.
 *
 * @param field The parameter to be validated from request.
 *
 * ```typescript
 * router.get(
 *     '/api/tags',
 *     query('search').contains('_'),
 *     handler
 * );
 * ```
 */
export declare const query: (field: string) => Validator;
/**
 * Validate request param.
 *
 * @param routeParam The parameter to be validated from request.
 *
 * ```typescript
 * router.get(
 *     '/api/users/:id',
 *     param('id').isInt(),
 *     handler
 * );
 * ```
 */
export declare const param: (routeParam: string) => Validator;
export * from "./lib/types";
