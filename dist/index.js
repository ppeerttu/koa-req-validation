"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.param = exports.query = exports.body = exports.validationResults = void 0;
const types_1 = require("./lib/types");
const utils_1 = require("./lib/utils");
const ValidationChain_1 = __importDefault(require("./lib/ValidationChain"));
const ValidationResult_1 = __importDefault(require("./lib/ValidationResult"));
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
const validationResults = (ctx) => {
    if (Array.isArray(ctx.state.validationResults)) {
        return ValidationResult_1.default.fromResults(ctx.state.validationResults);
    }
    return new ValidationResult_1.default([], []);
};
exports.validationResults = validationResults;
const check = (location, field) => {
    const chain = new ValidationChain_1.default(field, location);
    const middleware = (ctx, next) => chain.handleRequest(ctx, next);
    chain.middleware = middleware;
    return Object.assign(middleware, utils_1.bindAll(chain));
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
const body = (field) => check(types_1.ParamLocation.BODY, field);
exports.body = body;
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
const query = (field) => check(types_1.ParamLocation.QUERY, field);
exports.query = query;
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
const param = (routeParam) => check(types_1.ParamLocation.PARAM, routeParam);
exports.param = param;
__exportStar(require("./lib/types"), exports);
//# sourceMappingURL=index.js.map