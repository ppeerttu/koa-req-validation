import { ParameterizedContext } from 'koa';
import { IRouterContext } from 'koa-router';

import { ParamLocation } from './lib/types';
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
 * Interface describing matched data.
 */
export interface IMatchedData {

    /**
     * Each validated (and sanitated) parameter has a string key
     */
    [key: string]: string | number | boolean | Date;
}

/**
 * Koa context for validation operations.
 */
export interface IValidationContext extends IRouterContext {

    /**
     * Validation results
     */
    validationResults: ValidationResult[];

    /**
     * Data that has passed validation
     */
    matchedData: IMatchedData;
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
        let results: IValidationError[] = [];
        for (const result of ctx.state.validationResults) {
            results = [
                ...results,
                ...result.array(),
            ];
        }
        return new ValidationResult(results);
    }
    return new ValidationResult();
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

export const matchedData = (
    ctx: ParameterizedContext<IValidationContext>,
): IMatchedData => {
    if (ctx.state.matchedData) {
        return typeof ctx.state.matchedData === 'object' ? ctx.state.matchedData : {};
    }
    return {};
};
