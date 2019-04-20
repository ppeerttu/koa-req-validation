import { ParameterizedContext } from 'koa';
import { IRouterContext } from 'koa-router';
import ValidationChain from './lib/ValidationChain';
import ValidationResult from './lib/ValidationResult';
/**
 * Interface describing validation errors.
 */
export interface IValidationError {
    param: string;
    location: string;
    msg: string;
    value: string;
}
/**
 * Koa context for validation operations.
 */
export interface IValidationContext extends IRouterContext {
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
 * if (errors) {
 *     throw new RequestError(422, errors);
 * }
 */
export declare const validationResults: (ctx: ParameterizedContext<IValidationContext, {}>) => ValidationResult;
/**
 * Validate request body.
 *
 * @param param The parameter to be validated from request.
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
export declare const body: (param: string) => ValidationChain;
/**
 * Validate request query.
 *
 * @param param The parameter to be validated from request.
 *
 * ```typescript
 * router.get(
 *     '/api/tags',
 *     query('search').contains('_').run(),
 *     handler
 * );
 * ```
 */
export declare const query: (param: string) => ValidationChain;
/**
 * Validate request param.
 *
 * @param param The parameter to be validated from request.
 *
 * ```typescript
 * router.get(
 *     '/api/users/:id',
 *     param('id').isInt().run(),
 *     handler
 * );
 * ```
 */
export declare const param: (param: string) => ValidationChain;
