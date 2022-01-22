import { Middleware, RouterContext } from "@koa/router";
import { ParamLocation, Validator } from "./lib/types";
import { bindAll } from "./lib/utils";
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
export const validationResults = (ctx: RouterContext): ValidationResult => {
    if (Array.isArray(ctx.state.validationResults)) {
        return ValidationResult.fromResults(ctx.state.validationResults);
    }
    return new ValidationResult([], []);
};

const check = (location: ParamLocation, field: string): Validator => {
    const chain = new ValidationChain<Validator>(field, location);
    const middleware: Middleware = (ctx, next) => chain.handleRequest(ctx, next);
    chain.middleware = middleware as Validator;
    return Object.assign<Middleware, ValidationChain<Validator>>(
        middleware,
        bindAll(chain) as ValidationChain<Validator>
    );
};

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
export const body = (field: string): Validator => check(ParamLocation.BODY, field);

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
export const query = (field: string): Validator => check(ParamLocation.QUERY, field);

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
export const param = (routeParam: string): Validator =>
    check(ParamLocation.PARAM, routeParam);

export * from "./lib/types";
