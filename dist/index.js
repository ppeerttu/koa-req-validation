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
const body = (bodyParam) => new ValidationChain_1.default(bodyParam, types_1.ParamLocation.BODY);
exports.body = body;
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
const query = (queryString) => new ValidationChain_1.default(queryString, types_1.ParamLocation.QUERY);
exports.query = query;
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
const param = (routeParam) => new ValidationChain_1.default(routeParam, types_1.ParamLocation.PARAM);
exports.param = param;
__exportStar(require("./lib/types"), exports);
//# sourceMappingURL=index.js.map