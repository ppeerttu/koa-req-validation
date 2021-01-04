"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
        this.defaultErrorMessage = "Invalid value";
        /**
         * Validations and sanitations to be executed.
         */
        this.operations = [];
        /**
         * Is this parameter optional?
         */
        this.isOptional = { value: false };
        /**
         * Build the validation chain. This method has to be called at the end of each
         * validation.
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
        this.build = () => (ctx, next) => __awaiter(this, void 0, void 0, function* () {
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
        /**
         * @deprecated Use `build()` instead
         */
        this.run = () => {
            console.warn("ValidationChain.run() is deprecated. Please use .build() instead.");
            return this.build();
        };
        this.parameter = parameter.split(".");
        if (!Object.values(types_1.ParamLocation).includes(location)) {
            throw new TypeError(`Param location has to be one of ` +
                Object.values(types_1.ParamLocation).join(", ") +
                ` but received ${location}`);
        }
        this.location = location;
    }
    /**
     * Pass a custom message to the validation.
     *
     * @param message Custom message
     *
     * @throws {Error} No validation has been set before `withMessage()` has been called
     */
    withMessage(message) {
        if (this.operations.length < 1) {
            throw new Error(`Can't set a validation error message using withMessage() when ` +
                `no validations have been defined`);
        }
        const validationDefinition = this.operations[this.operations.length - 1];
        if (validationDefinition.type === "sanitation") {
            throw new Error(`Can't set a validation error message using withMessage() ` +
                `to a sanitizer definition! Please call withMessage() immediately after ` +
                `the validation definition.`);
        }
        validationDefinition.message = message;
        return this;
    }
    /**
     * Set this property as optional.
     */
    optional(options) {
        this.isOptional = {
            value: true,
            options,
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
        if (typeof func !== "function") {
            throw new TypeError(`Expected to receive a custom validation function but received: ${func}`);
        }
        this.operations.push({
            type: "validation",
            validation: "custom",
            func,
        });
        return this;
    }
    /**
     * Check if the request property contains the given seed.
     */
    contains(seed) {
        this.operations.push({
            type: "validation",
            validation: "contains",
            options: seed,
        });
        return this;
    }
    /**
     * Check if the request property equals the given comparison.
     */
    equals(comparison) {
        this.operations.push({
            type: "validation",
            validation: "equals",
            options: comparison,
        });
        return this;
    }
    /**
     * Check if the parameter is an integer.
     */
    isInt(options) {
        this.operations.push({
            type: "validation",
            validation: "isInt",
            options,
        });
        return this;
    }
    /**
     * Check if the string is in given length.
     *
     * @param options Min and max length
     */
    isLength(options) {
        this.operations.push({
            type: "validation",
            validation: "isLength",
            options,
        });
        return this;
    }
    /**
     * Check if the parameter is an email.
     */
    isEmail(options) {
        this.operations.push({
            type: "validation",
            validation: "isEmail",
            options,
        });
        return this;
    }
    /**
     * Check if the parameter is a boolean value.
     */
    isBoolean() {
        this.operations.push({
            type: "validation",
            validation: "isBoolean",
        });
        return this;
    }
    /**
     * Check if the parameter is a zero length string.
     */
    isEmpty(options) {
        this.operations.push({
            type: "validation",
            validation: "isEmpty",
            options,
        });
        return this;
    }
    /**
     * Check if the parameter is a float.
     */
    isFloat(options) {
        this.operations.push({
            type: "validation",
            validation: "isFloat",
            options,
        });
        return this;
    }
    /**
     * Check if the parameter is an algorithm.
     *
     * @param algorithm The algorithm
     */
    isHash(algorithm) {
        this.operations.push({
            type: "validation",
            validation: "isHash",
            options: algorithm,
        });
        return this;
    }
    /**
     * Check if the parameter is a valid JWT token.
     */
    isJWT() {
        this.operations.push({
            type: "validation",
            validation: "isJWT",
        });
        return this;
    }
    /**
     * Check if the parameter is a valid JSON. Uses
     * `JSON.parse`.
     */
    isJSON() {
        this.operations.push({
            type: "validation",
            validation: "isJSON",
        });
        return this;
    }
    /**
     * Check if the parameter is a latitude-lognitude coordinate
     * in the format `lat,long` or `lat, long`.
     */
    isLatLong() {
        this.operations.push({
            type: "validation",
            validation: "isLatLong",
        });
        return this;
    }
    /**
     * Check if the paramter contains only lowercase characters.
     */
    isLowercase() {
        this.operations.push({
            type: "validation",
            validation: "isLowercase",
        });
        return this;
    }
    /**
     * Check if the parameter is a MAC address.
     */
    isMACAddress(options) {
        this.operations.push({
            type: "validation",
            validation: "isMACAddress",
            options,
        });
        return this;
    }
    /**
     * Check if the parameter is a valid MongoDB ObjectId.
     */
    isMongoId() {
        this.operations.push({
            type: "validation",
            validation: "isMongoId",
        });
        return this;
    }
    /**
     * Check if the parameter contains only numbers.
     */
    isNumeric(options) {
        this.operations.push({
            type: "validation",
            validation: "isNumeric",
            options,
        });
        return this;
    }
    /**
     * Check if the parameter is a valid port number.
     */
    isPort() {
        this.operations.push({
            type: "validation",
            validation: "isPort",
        });
        return this;
    }
    /**
     * Check if the parameter is valid UUID (v3, v4 or v5).
     */
    isUUID(version) {
        this.operations.push({
            type: "validation",
            validation: "isUUID",
            options: version,
        });
        return this;
    }
    /**
     * Check if the parameter contains only uppercase characters.
     */
    isUppercase() {
        this.operations.push({
            type: "validation",
            validation: "isUppercase",
        });
        return this;
    }
    /**
     * Check if the parameter matches given regular expression.
     *
     * @param regExp The regular expression
     */
    matches(regExp) {
        this.operations.push({
            type: "validation",
            validation: "matches",
            options: regExp,
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
        this.operations.push({
            type: "validation",
            validation: "isIn",
            options: values,
        });
        return this;
    }
    /**
     * Check if the string is a date that's after the specified
     * date (defaults to now).
     *
     * @param date The date (defaults to now)
     */
    isAfter(date) {
        this.operations.push({
            type: "validation",
            validation: "isAfter",
            options: date,
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
        this.operations.push({
            type: "validation",
            validation: "isAlpha",
            options: locale,
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
        this.operations.push({
            type: "validation",
            validation: "isAlphanumeric",
            options: locale,
        });
        return this;
    }
    /**
     * Check if the string contains ACII characters only.
     */
    isAscii() {
        this.operations.push({
            type: "validation",
            validation: "isAscii",
        });
        return this;
    }
    /**
     * Check if the string is base64 encoded.
     */
    isBase64() {
        this.operations.push({
            type: "validation",
            validation: "isBase64",
        });
        return this;
    }
    /**
     * Check if the string is a date that's before
     * the given date, which defaults to now.
     *
     * @param date The date (defaults to now)
     */
    isBefore(date) {
        this.operations.push({
            type: "validation",
            validation: "isBefore",
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
        this.operations.push({
            type: "validation",
            validation: "isByteLength",
            options,
        });
        return this;
    }
    /**
     * Check if the string is a credit card.
     */
    isCreditCard() {
        this.operations.push({
            type: "validation",
            validation: "isCreditCard",
        });
        return this;
    }
    /**
     * Check if the string is a valid currency amount.
     *
     * @param options The options
     */
    isCurrency(options) {
        this.operations.push({
            type: "validation",
            validation: "isCurrency",
            options,
        });
        return this;
    }
    /**
     * Check if the string is a data uri format.
     */
    isDataURI() {
        this.operations.push({
            type: "validation",
            validation: "isDataURI",
        });
        return this;
    }
    /**
     * Check if the string represents a decimal number.
     *
     * @param options The options
     */
    isDecimal(options) {
        this.operations.push({
            type: "validation",
            validation: "isDecimal",
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
        this.operations.push({
            type: "validation",
            validation: "isDivisibleBy",
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
        this.operations.push({
            type: "validation",
            validation: "isFQDN",
            options,
        });
        return this;
    }
    /**
     * Check if the string contains any full-width
     * chars.
     */
    isFullWidth() {
        this.operations.push({
            type: "validation",
            validation: "isFullWidth",
        });
        return this;
    }
    /**
     * Check if the string contains any half-width
     * chars.
     */
    isHalfWidth() {
        this.operations.push({
            type: "validation",
            validation: "isHalfWidth",
        });
        return this;
    }
    /**
     * Check if the string is a hexadecimal
     * color.
     */
    isHexColor() {
        this.operations.push({
            type: "validation",
            validation: "isHexColor",
        });
        return this;
    }
    /**
     * Check if the string is a hexadecimal
     * number.
     */
    isHexadecimal() {
        this.operations.push({
            type: "validation",
            validation: "isHexadecimal",
        });
        return this;
    }
    /**
     * Check if the string is an IP (ver 4 or 6).
     */
    isIP(version) {
        this.operations.push({
            type: "validation",
            validation: "isIP",
            options: version,
        });
        return this;
    }
    /**
     * Check if the string is an IP range (ver 4 only).
     */
    isIPRange() {
        this.operations.push({
            type: "validation",
            validation: "isIPRange",
        });
        return this;
    }
    /**
     * Check if the string is an ISBN.
     *
     * @param version The version
     */
    isISBN(version) {
        this.operations.push({
            type: "validation",
            validation: "isISBN",
            options: version,
        });
        return this;
    }
    /**
     * Check if the string is an ISSN.
     *
     * @param options The options
     */
    isISSN(options) {
        this.operations.push({
            type: "validation",
            validation: "isISSN",
            options,
        });
        return this;
    }
    /**
     * Check if the string is an ISIN.
     */
    isISIN() {
        this.operations.push({
            type: "validation",
            validation: "isISIN",
        });
        return this;
    }
    /**
     * Check if the string is valid ISO8601 date.
     */
    isISO8601(options) {
        this.operations.push({
            type: "validation",
            validation: "isISO8601",
            options,
        });
        return this;
    }
    /**
     * Check if the string is valid RFC3339 date.
     */
    isRFC3339() {
        this.operations.push({
            type: "validation",
            validation: "isRFC3339",
        });
        return this;
    }
    /**
     * Check if the string is a valid ISO 3166-1 alpha-2
     * officially assigned country code.
     */
    isISO31661Alpha2() {
        this.operations.push({
            type: "validation",
            validation: "isISO31661Alpha2",
        });
        return this;
    }
    /**
     * Check if the string is a valid ISO 3166-1 alpha-3
     * officially assigned country code.
     */
    isISO31661Alpha3() {
        this.operations.push({
            type: "validation",
            validation: "isISO31661Alpha3",
        });
        return this;
    }
    /**
     * Check if the string is a ISRC.
     */
    isISRC() {
        this.operations.push({
            type: "validation",
            validation: "isISRC",
        });
        return this;
    }
    /**
     * Check if the string is a MD5 hash.
     */
    isMD5() {
        this.operations.push({
            type: "validation",
            validation: "isMD5",
        });
        return this;
    }
    /**
     * Check if the string is a valid MIME type format.
     */
    isMimeType() {
        this.operations.push({
            type: "validation",
            validation: "isMimeType",
        });
        return this;
    }
    /**
     * Check if the string is a mobile phone number.
     *
     * @param locale The locale, defaults to any
     */
    isMobilePhone(locale = "any") {
        this.operations.push({
            type: "validation",
            validation: "isMobilePhone",
            options: locale,
        });
        return this;
    }
    /**
     * Check if the string contains one or more multibyte chars.
     */
    isMultibyte() {
        this.operations.push({
            type: "validation",
            validation: "isMultibyte",
        });
        return this;
    }
    /**
     * Check if the string is a postal code.
     *
     * @param locale The locale to use
     */
    isPostalCode(locale = "any") {
        this.operations.push({
            type: "validation",
            validation: "isPostalCode",
            options: locale,
        });
        return this;
    }
    /**
     * Check if the string contains any surrogate pairs chars.
     */
    isSurrogatePair() {
        this.operations.push({
            type: "validation",
            validation: "isSurrogatePair",
        });
        return this;
    }
    /**
     * Check if the string is an URL.
     *
     * @param options Possible options
     */
    isURL(options) {
        this.operations.push({
            type: "validation",
            validation: "isURL",
            options,
        });
        return this;
    }
    /**
     * Check if the string contains a mixture of full and half-width chars.
     */
    isVariableWidth() {
        this.operations.push({
            type: "validation",
            validation: "isVariableWidth",
        });
        return this;
    }
    /**
     * Checks characters if they appear in the whitelist.
     *
     * @param chars The characters
     */
    isWhitelisted(chars) {
        this.operations.push({
            type: "validation",
            validation: "isWhitelisted",
            options: chars,
        });
        return this;
    }
    /**
     * Remove characters that appear in the blacklist. The characters are used in a RegExp
     *  and so you will need to escape some chars, e.g. blacklist(input, '\\[\\]').
     *
     * @param chars Characters to blacklist
     */
    blacklist(chars) {
        this.operations.push({
            type: "sanitation",
            sanitation: "blacklist",
            options: chars,
        });
        return this;
    }
    /**
     * Replace <, >, &, ', ' and / with HTML entities.
     */
    escape() {
        this.operations.push({
            type: "sanitation",
            sanitation: "escape",
        });
        return this;
    }
    /**
     * Replaces HTML encoded entities with <, >, &, ", ' and /.
     */
    unescape() {
        this.operations.push({
            type: "sanitation",
            sanitation: "unescape",
        });
        return this;
    }
    /**
     * Trim characters from the left-side of the input.
     *
     * @param chars The characters to trim
     */
    ltrim(chars) {
        this.operations.push({
            type: "sanitation",
            sanitation: "ltrim",
            options: chars,
        });
        return this;
    }
    /**
     * Trim characters from the right-side of the input.
     *
     * @param chars The characters to trim
     */
    rtrim(chars) {
        this.operations.push({
            type: "sanitation",
            sanitation: "rtrim",
            options: chars,
        });
        return this;
    }
    /**
     * Normalize email address.
     *
     * @param options The options
     *
     * @see https://github.com/chriso/validator.js For details
     */
    normalizeEmail(options) {
        this.operations.push({
            type: "sanitation",
            sanitation: "normalizeEmail",
            options,
        });
        return this;
    }
    /**
     * Remove characters with a numerical value < 32 and 127, mostly control characters.
     * If keep_new_lines is true, newline characters are preserved (\n and \r, hex 0xA
     * and 0xD). Unicode-safe in JavaScript.
     *
     * @param keepNewLines
     */
    stripLow(keepNewLines = false) {
        this.operations.push({
            type: "sanitation",
            sanitation: "stripLow",
            options: keepNewLines,
        });
        return this;
    }
    /**
     * convert the input string to a boolean. Everything except for '0', 'false' and ''
     * returns true. In strict mode only '1' and 'true' return true.
     */
    toBoolean(strict = false) {
        this.operations.push({
            type: "sanitation",
            sanitation: "toBoolean",
            options: strict,
        });
        return this;
    }
    /**
     * Convert the input string to a date.
     */
    toDate() {
        this.operations.push({
            type: "sanitation",
            sanitation: "toDate",
        });
        return this;
    }
    /**
     * Convert the input string to a float.
     */
    toFloat() {
        this.operations.push({
            type: "sanitation",
            sanitation: "toFloat",
        });
        return this;
    }
    /**
     * Convert the input string to an integer, or NaN if the input is not an integer.
     */
    toInt(radix = 10) {
        this.operations.push({
            type: "sanitation",
            sanitation: "toInt",
            options: radix,
        });
        return this;
    }
    /**
     * Trim characters (whitespace by default) from both sides of the input.
     *
     * @param chars The characters to trim
     */
    trim(chars) {
        this.operations.push({
            type: "sanitation",
            sanitation: "trim",
            options: chars,
        });
        return this;
    }
    /**
     * Remove characters that do not appear in the whitelist. The characters are used in a
     * RegExp and so you will need to escape some chars, e.g. whitelist(input, '\\[\\]').
     *
     * @param chars Characters to whitelist
     */
    whitelist(chars) {
        this.operations.push({
            type: "sanitation",
            sanitation: "whitelist",
            options: chars,
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
            input = originalInput = this.getOriginalInput(ctx);
            if (typeof input === "undefined") {
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
            const errors = yield this.operations.reduce((arrP, current) => __awaiter(this, void 0, void 0, function* () {
                const arr = yield arrP;
                const { type } = current;
                if (type === "sanitation" && input !== null) {
                    // If some of the validations has failed, we can't do any sanitations
                    if (arr.length) {
                        return arr;
                    }
                    input = this.sanitize(input, current);
                    return arr;
                }
                const { validation, options, message, func, } = current;
                const finalMessage = typeof message === "function"
                    ? message(ctx, input === null ? "" : input + "")
                    : message;
                if (validation === "custom") {
                    try {
                        yield func(input, ctx);
                    }
                    catch (e) {
                        arr.push({
                            msg: finalMessage || e.message || this.defaultErrorMessage,
                            location: this.location,
                            param: this.parameter.join("."),
                            value: originalInput + "",
                        });
                    }
                }
                else if (input === null || !validator_1.default[validation](input, options)) {
                    arr.push({
                        msg: finalMessage || this.defaultErrorMessage,
                        location: this.location,
                        param: this.parameter.join("."),
                        value: originalInput + "",
                    });
                }
                return arr;
            }), Promise.resolve([]));
            return new ValidationResult_1.default(this.parameter.join("."), errors.length ? undefined : input, errors);
        });
    }
    /**
     * Get original input as it is from the request body.
     *
     * @param ctx The context
     */
    getOriginalInput(ctx) {
        let obj;
        switch (this.location) {
            case types_1.ParamLocation.BODY:
                obj = ctx.request.body;
                break;
            case types_1.ParamLocation.PARAM:
                obj = ctx.params;
                break;
            case types_1.ParamLocation.QUERY:
                obj = ctx.query;
                break;
        }
        return this.getParamFromObject(obj);
    }
    /**
     * Get parameter from object.
     *
     * @param object Object to look the property from
     */
    getParamFromObject(object) {
        return this.parameter.reduce((prev, current) => {
            if (typeof prev === "object" && prev) {
                return prev[current];
            }
            return undefined;
        }, object);
    }
    /**
     * Sanitize the given input value with given sanitation definition.
     *
     * @param input The input as string
     */
    sanitize(input, sanitationDefinition) {
        const { sanitation, options } = sanitationDefinition;
        const fn = validator_1.default[sanitation];
        return fn(input, options);
    }
}
exports.default = ValidationChain;
//# sourceMappingURL=ValidationChain.js.map