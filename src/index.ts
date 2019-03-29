import { ParameterizedContext } from 'koa';
import { IRouterContext } from 'koa-router';

import ValidationChain from './lib/ValidationChain';
import { ParamLocation } from './lib/types';
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
export const validationResults = (
    ctx: ParameterizedContext<IValidationContext>
): ValidationResult => {
    if (Array.isArray(ctx.state.validationResults)) {
        let results: IValidationError[] = [];
        for (const result of ctx.state.validationResults) {
            results = [
                ...results,
                ...result.array()
            ];
        }
        return new ValidationResult(results);
    }
    return new ValidationResult();
}

/**
 * Validate request body.
 * 
 * @param param The parameter to be validated from request.
 * 
 * @example
 * router.post('/auth/login', body('username').equals('user').run(), body('password').equals('pass').run(), handler);
 */
export const body = (param: string) => {
    const validationChain = new ValidationChain(param, ParamLocation.BODY);
    return validationChain;
}

/**
 * Validate request query.
 * 
 * @param param The parameter to be validated from request.
 * 
 * @example
 * router.get('/api/tags', query('search').contains('_').run(), handler);
 */
export const query = (param: string) => {
    const validationChain = new ValidationChain(param, ParamLocation.QUERY);
    return validationChain;
}

/**
 * Validate request param.
 * 
 * @param param The parameter to be validated from request.
 * 
 * @example
 * router.get('/api/users/:id', param('id').isInt().run(), handler);
 */
export const param = (param: string) => {
    const validationChain = new ValidationChain(param, ParamLocation.PARAM);
    return validationChain;
}

