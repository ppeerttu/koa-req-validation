/// <reference types="koa-bodyparser" />
import { ParameterizedContext } from 'koa';
import { IRouterContext } from 'koa-router';
import ValidationChain from './lib/ValidationChain';
import ValidationResult from './lib/ValidationResult';
/**
 * Koa context for validation operations.
 */
export interface IValidationContext extends IRouterContext {
    /**
     * Validation results
     */
    validationResults: ValidationResult[];
}
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
export declare const validationResults: (ctx: ParameterizedContext<IValidationContext, import("koa").DefaultContext>) => ValidationResult;
/**
 * Validate request body.
 *
 * @param bodyParam The parameter to be validated from request.
 *
 * ```typescript
 * router.post(
 *     '/auth/login',
 *     body('username').equals('user').run(),
 *     body('password').equals('pass').run(),
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
 *     query('search').contains('_').run(),
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
 *     param('id').isInt().run(),
 *     handler
 * );
 * ```
 */
export declare const param: (routeParam: string) => ValidationChain;
export * from './lib/types';
