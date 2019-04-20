"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ValidationChain_1 = __importDefault(require("./lib/ValidationChain"));
const types_1 = require("./lib/types");
const ValidationResult_1 = __importDefault(require("./lib/ValidationResult"));
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
exports.validationResults = (ctx) => {
    if (Array.isArray(ctx.state.validationResults)) {
        let results = [];
        for (const result of ctx.state.validationResults) {
            results = [
                ...results,
                ...result.array()
            ];
        }
        return new ValidationResult_1.default(results);
    }
    return new ValidationResult_1.default();
};
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
exports.body = (param) => {
    const validationChain = new ValidationChain_1.default(param, types_1.ParamLocation.BODY);
    return validationChain;
};
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
exports.query = (param) => {
    const validationChain = new ValidationChain_1.default(param, types_1.ParamLocation.QUERY);
    return validationChain;
};
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
exports.param = (param) => {
    const validationChain = new ValidationChain_1.default(param, types_1.ParamLocation.PARAM);
    return validationChain;
};
//# sourceMappingURL=index.js.map