import { ParameterizedContext } from 'koa';
import { IRouterContext } from 'koa-router';

import { ParamLocation } from './lib/types';
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
export const validationResults = (
    ctx: ParameterizedContext<IValidationContext>,
): ValidationResult => {
    if (Array.isArray(ctx.state.validationResults)) {
        return ValidationResult.fromResults(ctx.state.validationResults);
    }
    return new ValidationResult([], []);
};

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
export const body = (bodyParam: string) => {
    const validationChain = new ValidationChain(bodyParam, ParamLocation.BODY);
    return validationChain;
};

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
export const query = (queryString: string) => {
    const validationChain = new ValidationChain(queryString, ParamLocation.QUERY);
    return validationChain;
};

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
export const param = (routeParam: string) => {
    const validationChain = new ValidationChain(routeParam, ParamLocation.PARAM);
    return validationChain;
};

export * from './lib/types';
