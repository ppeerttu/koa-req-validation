"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./lib/types");
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
exports.validationResults = (ctx) => {
    if (Array.isArray(ctx.state.validationResults)) {
        return ValidationResult_1.default.fromResults(ctx.state.validationResults);
    }
    return new ValidationResult_1.default([], []);
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
exports.body = (bodyParam) => new ValidationChain_1.default(bodyParam, types_1.ParamLocation.BODY);
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
exports.query = (queryString) => new ValidationChain_1.default(queryString, types_1.ParamLocation.QUERY);
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
exports.param = (routeParam) => new ValidationChain_1.default(routeParam, types_1.ParamLocation.PARAM);
__export(require("./lib/types"));
//# sourceMappingURL=index.js.map