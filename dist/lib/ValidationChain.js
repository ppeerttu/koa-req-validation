"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validator_1 = __importDefault(require("validator"));
const types_1 = require("./types");
const ValidationResult_1 = __importDefault(require("./ValidationResult"));
/**
 * The validation chain object.
 */
class ValidationChain {
    /**
     * Create a new ValidationChain.
     *
     * @param parameter Name of the parameter to validate
     * @param location Location of the parameter in request
     */
    constructor(parameter, location) {
        /**
         * Default error message when validation fails.
         */
        this.defaultErrorMessage = 'Invalid value';
        /**
         * Run the validation. This method has to be called
         * at the end of each validation.
         * ```typescript
         * router.post(
         *     '/auth/login',
         *     body('username').equals('user').run(),
         *     body('password').equals('pass').run(),
         *     handler
         * );
         * ```
         */
        this.run = () => (ctx, next) => __awaiter(this, void 0, void 0, function* () {
            const results = yield this.checkResults(ctx);
            if (results) {
                if (Array.isArray(ctx.state.validationResults)) {
                    ctx.state.validationResults.push(results);
                }
                else {
                    ctx.state.validationResults = [results];
                }
            }
            yield next();
        });
        this.parameter = parameter;
        if (!Object.values(types_1.ParamLocation).includes(location)) {
            throw new TypeError(`Param location has to be one of `
                + Object.values(types_1.ParamLocation).join(', ')
                + ` but received ${location}`);
        }
        this.location = location;
        this.validations = [];
        this.isOptional = { value: false };
    }
    /**
     * Pass a custom message to the validation.
     *
     * @param message Custom message
     */
    withMessage(message) {
        const validationDefinition = this.validations[this.validations.length - 1];
        validationDefinition.message = message;
        return this;
    }
    /**
     * Set this property as optional.
     */
    optional(options) {
        this.isOptional = {
            value: true,
            options
        };
        return this;
    }
    /**
     * Custom async validation function to execute. The function
     * must throw when the validation fails.
     *
     * @param func The validation function
     */
    custom(func) {
        this.validations.push({
            validation: 'custom',
            func
        });
        return this;
    }
    /**
     * Check if the request property contains the given seed.
     */
    contains(seed) {
        this.validations.push({
            validation: 'contains',
            options: seed
        });
        return this;
    }
    /**
     * Check if the request property equals the given comparison.
     */
    equals(comparison) {
        this.validations.push({
            validation: 'equals',
            options: comparison
        });
        return this;
    }
    /**
     * Check if the parameter is an integer.
     */
    isInt(options) {
        this.validations.push({
            validation: 'isInt',
            options
        });
        return this;
    }
    /**
     * Check if the string is in given length.
     *
     * @param options Min and max length
     */
    isLength(options) {
        this.validations.push({
            validation: 'isLength',
            options
        });
        return this;
    }
    /**
     * Check if the parameter is an email.
     */
    isEmail() {
        this.validations.push({
            validation: 'isEmail'
        });
        return this;
    }
    /**
     * Check if the parameter is a boolean value.
     */
    isBoolean() {
        this.validations.push({
            validation: 'isBoolean'
        });
        return this;
    }
    /**
     * Check if the parameter is a zero length string.
     */
    isEmpty() {
        this.validations.push({
            validation: 'isEmpty',
        });
        return this;
    }
    /**
     * Check if the parameter is a float.
     */
    isFloat() {
        this.validations.push({
            validation: 'isFloat',
        });
        return this;
    }
    /**
     * Check if the parameter is an algorithm.
     *
     * @param algorithm The algorithm
     */
    isHash(algorithm) {
        this.validations.push({
            validation: 'isHash',
            options: algorithm
        });
        return this;
    }
    /**
     * Check if the parameter is a valid JWT token.
     */
    isJWT() {
        this.validations.push({
            validation: 'isJWT',
        });
        return this;
    }
    /**
     * Check if the parameter is a valid JSON. Uses
     * `JSON.parse`.
     */
    isJSON() {
        this.validations.push({
            validation: 'isJSON'
        });
        return this;
    }
    /**
     * Check if the parameter is a latitude-lognitude coordinate
     * in the format `lat,long` or `lat, long`.
     */
    isLatLong() {
        this.validations.push({
            validation: 'isLatLong',
        });
        return this;
    }
    /**
     * Check if the paramter contains only lowercase characters.
     */
    isLowercase() {
        this.validations.push({
            validation: 'isLowercase',
        });
        return this;
    }
    /**
     * Check if the parameter is a MAC address.
     */
    isMACAddress() {
        this.validations.push({
            validation: 'isMACAddress',
        });
        return this;
    }
    /**
     * Check if the parameter is a valid MongoDB ObjectId.
     */
    isMongoId() {
        this.validations.push({
            validation: 'isMongoId',
        });
        return this;
    }
    /**
     * Check if the parameter contains only numbers.
     */
    isNumeric() {
        this.validations.push({
            validation: 'isNumeric',
        });
        return this;
    }
    /**
     * Check if the parameter is a valid port number.
     */
    isPort() {
        this.validations.push({
            validation: 'isPort',
        });
        return this;
    }
    /**
     * Check if the parameter is valid UUID (v3, v4 or v5).
     */
    isUUID() {
        this.validations.push({
            validation: 'isUUID',
        });
        return this;
    }
    /**
     * Check if the parameter contains only uppercase characters.
     */
    isUppercase() {
        this.validations.push({
            validation: 'isUppercase',
        });
        return this;
    }
    /**
     * Check if the parameter matches given regular expression.
     *
     * @param regExp The regular expression
     */
    matches(regExp) {
        this.validations.push({
            validation: 'matches',
            options: regExp
        });
        return this;
    }
    /**
     * Check if the parameter is some of the allowed
     * values.
     *
     * @param values Options containing at least `values`
     * property with allowed values
     */
    isIn(values) {
        this.validations.push({
            validation: 'isIn',
            options: values
        });
        return this;
    }
    /**
     * Check if the string is a date that's after the specified
     * date (defaults to now).
     *
     * @param date The date
     */
    isAfter(date = new Date().toString()) {
        this.validations.push({
            validation: 'isAfter',
            options: date
        });
        return this;
    }
    /**
     * Check if the string contains only letters. Locale
     * defaults to en-US.
     *
     * @param locale The locale
     */
    isAlpha(locale) {
        this.validations.push({
            validation: 'isAlpha',
            options: locale
        });
        return this;
    }
    /**
     * Check if the string contains only letters and numbers.
     * Locale defaults to en-US.
     *
     * @param locale The locale
     */
    isAlphanumeric(locale) {
        this.validations.push({
            validation: 'isAlphanumeric',
            options: locale
        });
        return this;
    }
    /**
     * Check if the string contains ACII characters only.
     */
    isAscii() {
        this.validations.push({
            validation: 'isAscii',
        });
        return this;
    }
    /**
     * Check if the string is base64 encoded.
     */
    isBase64() {
        this.validations.push({
            validation: 'isBase64',
        });
        return this;
    }
    /**
     * Check if the string is a date that's before
     * the given date. Defaults to now.
     *
     * @param date The date
     */
    isBefore(date = new Date().toString()) {
        this.validations.push({
            validation: 'isBefore',
            options: date,
        });
        return this;
    }
    /**
     * Check if the strin's length (in UTF-8 bytes)
     * falls in range.
     *
     * @param options The range
     */
    isByteLength(options = { min: 0 }) {
        this.validations.push({
            validation: 'isByteLength',
            options,
        });
        return this;
    }
    /**
     * Check if the string is a credit card.
     */
    isCreditCard() {
        this.validations.push({
            validation: 'isCreditCard',
        });
        return this;
    }
    /**
     * Check if the string is a valid currency amount.
     *
     * @param options The options
     */
    isCurrency(options) {
        this.validations.push({
            validation: 'isCurrency',
            options
        });
        return this;
    }
    /**
     * Check if the string is a data uri format.
     */
    isDataURI() {
        this.validations.push({
            validation: 'isDataURI',
        });
        return this;
    }
    /**
     * Check if the string represents a decimal number.
     *
     * @param options The options
     */
    isDecimal(options) {
        this.validations.push({
            validation: 'isDecimal',
            options,
        });
        return this;
    }
    /**
     * Check if the string is a number divisible by
     * given number.
     *
     * @param division The division number
     */
    isDivisibleBy(division) {
        this.validations.push({
            validation: 'isDivisibleBy',
            options: division,
        });
        return this;
    }
    /**
     * Check if the string is fully qualified
     * domain name.
     *
     * @param options The options
     */
    isFQDN(options) {
        this.validations.push({
            validation: 'isFQDN',
            options,
        });
        return this;
    }
    /**
     * Check if the string contains any full-width
     * chars.
     */
    isFullWidth() {
        this.validations.push({
            validation: 'isFullWidth',
        });
        return this;
    }
    /**
     * Check if the string contains any half-width
     * chars.
     */
    isHalfWidth() {
        this.validations.push({
            validation: 'isHalfWidth',
        });
        return this;
    }
    /**
     * Check if the string is a hexadecimal
     * color.
     */
    isHexColor() {
        this.validations.push({
            validation: 'isHexColor',
        });
        return this;
    }
    /**
     * Check if the string is a hexadecimal
     * number.
     */
    isHexadecimal() {
        this.validations.push({
            validation: 'isHexadecimal',
        });
        return this;
    }
    /**
     * Check if the string is an IP (ver 4 or 6).
     */
    isIP(version) {
        this.validations.push({
            validation: 'isIP',
            options: version,
        });
        return this;
    }
    /**
     * Check if the string is an IP range (ver 4 only).
     */
    isIPRange() {
        this.validations.push({
            validation: 'isIPRange',
        });
        return this;
    }
    /**
     * Run the validations and return the results.
     * @param ctx The context
     */
    checkResults(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            let input;
            let originalInput;
            switch (this.location) {
                case types_1.ParamLocation.BODY:
                    input = ctx.request.body[this.parameter];
                    break;
                case types_1.ParamLocation.PARAM:
                    input = ctx.params[this.parameter];
                    break;
                case types_1.ParamLocation.QUERY:
                    input = ctx.query[this.parameter];
                    break;
            }
            originalInput = input;
            if (typeof input === 'undefined') {
                if (this.isOptional.value) {
                    return null;
                }
                input = null;
            }
            else if (input === null) {
                if (this.isOptional.options && this.isOptional.options.allowNull) {
                    return null;
                }
            }
            else {
                input = input.toString();
            }
            const errors = yield this.validations.reduce((arrP, current) => __awaiter(this, void 0, void 0, function* () {
                const arr = yield arrP;
                const { validation, options, message, func } = current;
                if (validation === 'custom') {
                    // Has to be thrown before the try-catch
                    // in order to notify the developer during development
                    if (!func) {
                        throw new Error(`No custom validation function defined for `
                            + `param ${this.parameter} at ${this.location}`);
                    }
                    try {
                        yield func(input, ctx);
                    }
                    catch (e) {
                        arr.push({
                            msg: message || e.message || this.defaultErrorMessage,
                            location: this.location,
                            param: this.parameter,
                            value: originalInput + ''
                        });
                    }
                    // @ts-ignore
                }
                else if (input === null || !validator_1.default[validation](input, options)) {
                    arr.push({
                        msg: message || this.defaultErrorMessage,
                        location: this.location,
                        param: this.parameter,
                        value: originalInput + ''
                    });
                }
                return arr;
            }), Promise.resolve([]));
            return new ValidationResult_1.default(errors);
        });
    }
}
exports.default = ValidationChain;
//# sourceMappingURL=ValidationChain.js.map