import { RouterContext } from '@koa/router';

import { ParamLocation } from './lib/types';
import ValidationChain from './lib/ValidationChain';
import ValidationResult from './lib/ValidationResult';

/**
 * Koa context for validation operations.
 */
export interface IValidationState {

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
    ctx: RouterContext<IValidationState>,
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
 *     body('username').equals('user').build(),
 *     body('password').equals('pass').build(),
 *     handler
 * );
 * ```
 */
export const body = (bodyParam: string) => new ValidationChain(
    bodyParam,
    ParamLocation.BODY,
);

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
export const query = (queryString: string) => new ValidationChain(
    queryString,
    ParamLocation.QUERY,
);

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
export const param = (routeParam: string) => new ValidationChain(
    routeParam,
    ParamLocation.PARAM,
);

export * from './lib/types';
