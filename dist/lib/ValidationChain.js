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
        this.hasNonStringSanitizer = false;
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
            // eslint-disable-next-line no-console
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
        return this.addValidation({
            type: "validation",
            validation: "custom",
            func,
        });
    }
    /**
     * Check if the request property contains the given seed.
     */
    contains(seed) {
        return this.addValidation({
            type: "validation",
            validation: "contains",
            options: seed,
        });
    }
    /**
     * Check if the request property equals the given comparison.
     */
    equals(comparison) {
        return this.addValidation({
            type: "validation",
            validation: "equals",
            options: comparison,
        });
    }
    /**
     * Check if the parameter is an integer.
     */
    isInt(options) {
        return this.addValidation({
            type: "validation",
            validation: "isInt",
            options,
        });
    }
    /**
     * Check if the string is in given length.
     *
     * @param options Min and max length
     */
    isLength(options) {
        return this.addValidation({
            type: "validation",
            validation: "isLength",
            options,
        });
    }
    /**
     * Check if the parameter is an email.
     */
    isEmail(options) {
        return this.addValidation({
            type: "validation",
            validation: "isEmail",
            options,
        });
    }
    /**
     * Check if the parameter is a boolean value.
     */
    isBoolean() {
        return this.addValidation({
            type: "validation",
            validation: "isBoolean",
        });
    }
    /**
     * Check if the parameter is a zero length string.
     */
    isEmpty(options) {
        return this.addValidation({
            type: "validation",
            validation: "isEmpty",
            options,
        });
    }
    /**
     * Check if the parameter is a float.
     */
    isFloat(options) {
        return this.addValidation({
            type: "validation",
            validation: "isFloat",
            options,
        });
    }
    /**
     * Check if the parameter is an algorithm.
     *
     * @param algorithm The algorithm
     */
    isHash(algorithm) {
        return this.addValidation({
            type: "validation",
            validation: "isHash",
            options: algorithm,
        });
    }
    /**
     * Check if the parameter is a valid JWT token.
     */
    isJWT() {
        return this.addValidation({
            type: "validation",
            validation: "isJWT",
        });
    }
    /**
     * Check if the parameter is a valid JSON. Uses
     * `JSON.parse`.
     */
    isJSON() {
        return this.addValidation({
            type: "validation",
            validation: "isJSON",
        });
    }
    /**
     * Check if the parameter is a latitude-lognitude coordinate
     * in the format `lat,long` or `lat, long`.
     */
    isLatLong() {
        return this.addValidation({
            type: "validation",
            validation: "isLatLong",
        });
    }
    /**
     * Check if the paramter contains only lowercase characters.
     */
    isLowercase() {
        return this.addValidation({
            type: "validation",
            validation: "isLowercase",
        });
    }
    /**
     * Check if the parameter is a MAC address.
     */
    isMACAddress(options) {
        return this.addValidation({
            type: "validation",
            validation: "isMACAddress",
            options,
        });
    }
    /**
     * Check if the parameter is a valid MongoDB ObjectId.
     */
    isMongoId() {
        return this.addValidation({
            type: "validation",
            validation: "isMongoId",
        });
    }
    /**
     * Check if the parameter contains only numbers.
     */
    isNumeric(options) {
        return this.addValidation({
            type: "validation",
            validation: "isNumeric",
            options,
        });
    }
    /**
     * Check if the parameter is a valid port number.
     */
    isPort() {
        return this.addValidation({
            type: "validation",
            validation: "isPort",
        });
    }
    /**
     * Check if the parameter is valid UUID (v3, v4 or v5).
     */
    isUUID(version) {
        return this.addValidation({
            type: "validation",
            validation: "isUUID",
            options: version,
        });
    }
    /**
     * Check if the parameter contains only uppercase characters.
     */
    isUppercase() {
        return this.addValidation({
            type: "validation",
            validation: "isUppercase",
        });
    }
    /**
     * Check if the parameter matches given regular expression.
     *
     * @param regExp The regular expression
     */
    matches(regExp) {
        return this.addValidation({
            type: "validation",
            validation: "matches",
            options: regExp,
        });
    }
    /**
     * Check if the parameter is some of the allowed
     * values.
     *
     * @param values Options containing at least `values`
     * property with allowed values
     */
    isIn(values) {
        return this.addValidation({
            type: "validation",
            validation: "isIn",
            options: values,
        });
    }
    /**
     * Check if the string is a date that's after the specified
     * date (defaults to now).
     *
     * @param date The date (defaults to now)
     */
    isAfter(date) {
        return this.addValidation({
            type: "validation",
            validation: "isAfter",
            options: date,
        });
    }
    /**
     * Check if the string contains only letters. Locale
     * defaults to en-US.
     *
     * @param locale The locale
     */
    isAlpha(locale) {
        return this.addValidation({
            type: "validation",
            validation: "isAlpha",
            options: locale,
        });
    }
    /**
     * Check if the string contains only letters and numbers.
     * Locale defaults to en-US.
     *
     * @param locale The locale
     */
    isAlphanumeric(locale) {
        return this.addValidation({
            type: "validation",
            validation: "isAlphanumeric",
            options: locale,
        });
    }
    /**
     * Check if the string contains ASCII characters only.
     */
    isAscii() {
        return this.addValidation({
            type: "validation",
            validation: "isAscii",
        });
    }
    /**
     * Check if the string is base64 encoded.
     */
    isBase64() {
        return this.addValidation({
            type: "validation",
            validation: "isBase64",
        });
    }
    /**
     * Check if the string is a date that's before
     * the given date, which defaults to now.
     *
     * @param date The date (defaults to now)
     */
    isBefore(date) {
        return this.addValidation({
            type: "validation",
            validation: "isBefore",
            options: date,
        });
    }
    /**
     * Check if the strin's length (in UTF-8 bytes)
     * falls in range.
     *
     * @param options The range
     */
    isByteLength(options = { min: 0 }) {
        return this.addValidation({
            type: "validation",
            validation: "isByteLength",
            options,
        });
    }
    /**
     * Check if the string is a credit card.
     */
    isCreditCard() {
        return this.addValidation({
            type: "validation",
            validation: "isCreditCard",
        });
    }
    /**
     * Check if the string is a valid currency amount.
     *
     * @param options The options
     */
    isCurrency(options) {
        return this.addValidation({
            type: "validation",
            validation: "isCurrency",
            options,
        });
    }
    /**
     * Check if the string is a data uri format.
     */
    isDataURI() {
        return this.addValidation({
            type: "validation",
            validation: "isDataURI",
        });
    }
    /**
     * Check if the string represents a decimal number.
     *
     * @param options The options
     */
    isDecimal(options) {
        return this.addValidation({
            type: "validation",
            validation: "isDecimal",
            options,
        });
    }
    /**
     * Check if the string is a number divisible by
     * given number.
     *
     * @param division The division number
     */
    isDivisibleBy(division) {
        return this.addValidation({
            type: "validation",
            validation: "isDivisibleBy",
            options: division,
        });
    }
    /**
     * Check if the string is fully qualified
     * domain name.
     *
     * @param options The options
     */
    isFQDN(options) {
        return this.addValidation({
            type: "validation",
            validation: "isFQDN",
            options,
        });
    }
    /**
     * Check if the string contains any full-width
     * chars.
     */
    isFullWidth() {
        return this.addValidation({
            type: "validation",
            validation: "isFullWidth",
        });
    }
    /**
     * Check if the string contains any half-width
     * chars.
     */
    isHalfWidth() {
        return this.addValidation({
            type: "validation",
            validation: "isHalfWidth",
        });
    }
    /**
     * Check if the string is a hexadecimal
     * color.
     */
    isHexColor() {
        return this.addValidation({
            type: "validation",
            validation: "isHexColor",
        });
    }
    /**
     * Check if the string is a hexadecimal
     * number.
     */
    isHexadecimal() {
        return this.addValidation({
            type: "validation",
            validation: "isHexadecimal",
        });
    }
    /**
     * Check if the string is an IP (ver 4 or 6).
     */
    isIP(version) {
        return this.addValidation({
            type: "validation",
            validation: "isIP",
            options: version,
        });
    }
    /**
     * Check if the string is an IP range (ver 4 only).
     */
    isIPRange() {
        return this.addValidation({
            type: "validation",
            validation: "isIPRange",
        });
    }
    /**
     * Check if the string is an ISBN.
     *
     * @param version The version
     */
    isISBN(version) {
        return this.addValidation({
            type: "validation",
            validation: "isISBN",
            options: version,
        });
    }
    /**
     * Check if the string is an ISSN.
     *
     * @param options The options
     */
    isISSN(options) {
        return this.addValidation({
            type: "validation",
            validation: "isISSN",
            options,
        });
    }
    /**
     * Check if the string is an ISIN.
     */
    isISIN() {
        return this.addValidation({
            type: "validation",
            validation: "isISIN",
        });
    }
    /**
     * Check if the string is valid ISO8601 date.
     */
    isISO8601(options) {
        return this.addValidation({
            type: "validation",
            validation: "isISO8601",
            options,
        });
    }
    /**
     * Check if the string is valid RFC3339 date.
     */
    isRFC3339() {
        return this.addValidation({
            type: "validation",
            validation: "isRFC3339",
        });
    }
    /**
     * Check if the string is a valid ISO 3166-1 alpha-2
     * officially assigned country code.
     */
    isISO31661Alpha2() {
        return this.addValidation({
            type: "validation",
            validation: "isISO31661Alpha2",
        });
    }
    /**
     * Check if the string is a valid ISO 3166-1 alpha-3
     * officially assigned country code.
     */
    isISO31661Alpha3() {
        return this.addValidation({
            type: "validation",
            validation: "isISO31661Alpha3",
        });
    }
    /**
     * Check if the string is a ISRC.
     */
    isISRC() {
        return this.addValidation({
            type: "validation",
            validation: "isISRC",
        });
    }
    /**
     * Check if the string is a MD5 hash.
     */
    isMD5() {
        return this.addValidation({
            type: "validation",
            validation: "isMD5",
        });
    }
    /**
     * Check if the string is a valid MIME type format.
     */
    isMimeType() {
        return this.addValidation({
            type: "validation",
            validation: "isMimeType",
        });
    }
    /**
     * Check if the string is a mobile phone number.
     *
     * @param locale The locale, defaults to any
     */
    isMobilePhone(locale = "any") {
        return this.addValidation({
            type: "validation",
            validation: "isMobilePhone",
            options: locale,
        });
    }
    /**
     * Check if the string contains one or more multibyte chars.
     */
    isMultibyte() {
        return this.addValidation({
            type: "validation",
            validation: "isMultibyte",
        });
    }
    /**
     * Check if the string is a postal code.
     *
     * @param locale The locale to use
     */
    isPostalCode(locale = "any") {
        return this.addValidation({
            type: "validation",
            validation: "isPostalCode",
            options: locale,
        });
    }
    /**
     * Check if the string contains any surrogate pairs chars.
     */
    isSurrogatePair() {
        return this.addValidation({
            type: "validation",
            validation: "isSurrogatePair",
        });
    }
    /**
     * Check if the string is an URL.
     *
     * @param options Possible options
     */
    isURL(options) {
        return this.addValidation({
            type: "validation",
            validation: "isURL",
            options,
        });
    }
    /**
     * Check if the string contains a mixture of full and half-width chars.
     */
    isVariableWidth() {
        return this.addValidation({
            type: "validation",
            validation: "isVariableWidth",
        });
    }
    /**
     * Checks characters if they appear in the whitelist.
     *
     * @param chars The characters
     */
    isWhitelisted(chars) {
        return this.addValidation({
            type: "validation",
            validation: "isWhitelisted",
            options: chars,
        });
    }
    /**
     * Remove characters that appear in the blacklist. The characters are used in a RegExp
     * and so you will need to escape some chars, e.g. blacklist(input, '\\[\\]').
     *
     * @param chars Characters to blacklist
     */
    blacklist(chars) {
        return this.addSanitation({
            type: "sanitation",
            sanitation: "blacklist",
            options: chars,
        });
    }
    /**
     * Replace <, >, &, ', ' and / with HTML entities.
     */
    escape() {
        return this.addSanitation({
            type: "sanitation",
            sanitation: "escape",
        });
    }
    /**
     * Replaces HTML encoded entities with <, >, &, ", ' and /.
     */
    unescape() {
        return this.addSanitation({
            type: "sanitation",
            sanitation: "unescape",
        });
    }
    /**
     * Trim characters from the left-side of the input.
     *
     * @param chars The characters to trim
     */
    ltrim(chars) {
        return this.addSanitation({
            type: "sanitation",
            sanitation: "ltrim",
            options: chars,
        });
    }
    /**
     * Trim characters from the right-side of the input.
     *
     * @param chars The characters to trim
     */
    rtrim(chars) {
        return this.addSanitation({
            type: "sanitation",
            sanitation: "rtrim",
            options: chars,
        });
    }
    /**
     * Normalize email address.
     *
     * @param options The options
     *
     * @see https://github.com/chriso/validator.js For details
     */
    normalizeEmail(options) {
        return this.addSanitation({
            type: "sanitation",
            sanitation: "normalizeEmail",
            options,
        });
    }
    /**
     * Remove characters with a numerical value < 32 and 127, mostly control characters.
     * If keep_new_lines is true, newline characters are preserved (\n and \r, hex 0xA
     * and 0xD). Unicode-safe in JavaScript.
     *
     * @param keepNewLines
     */
    stripLow(keepNewLines = false) {
        return this.addSanitation({
            type: "sanitation",
            sanitation: "stripLow",
            options: keepNewLines,
        });
    }
    /**
     * convert the input string to a boolean. Everything except for '0', 'false' and ''
     * returns true. In strict mode only '1' and 'true' return true.
     */
    toBoolean(strict = false) {
        return this.addSanitation({
            type: "sanitation",
            sanitation: "toBoolean",
            options: strict,
        }, true);
    }
    /**
     * Convert the input string to a date.
     */
    toDate() {
        return this.addSanitation({
            type: "sanitation",
            sanitation: "toDate",
        }, true);
    }
    /**
     * Convert the input string to a float.
     */
    toFloat() {
        return this.addSanitation({
            type: "sanitation",
            sanitation: "toFloat",
        }, true);
    }
    /**
     * Convert the input string to an integer, or NaN if the input is not an integer.
     */
    toInt(radix = 10) {
        return this.addSanitation({
            type: "sanitation",
            sanitation: "toInt",
            options: radix,
        }, true);
    }
    /**
     * Trim characters (whitespace by default) from both sides of the input.
     *
     * @param chars The characters to trim
     */
    trim(chars) {
        return this.addSanitation({
            type: "sanitation",
            sanitation: "trim",
            options: chars,
        });
    }
    /**
     * Remove characters that do not appear in the whitelist. The characters are used in a
     * RegExp and so you will need to escape some chars, e.g. whitelist(input, '\\[\\]').
     *
     * @param chars Characters to whitelist
     */
    whitelist(chars) {
        return this.addSanitation({
            type: "sanitation",
            sanitation: "whitelist",
            options: chars,
        });
    }
    /**
     * Run the validations and return the results.
     * @param ctx The context
     */
    checkResults(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const originalInput = this.getOriginalInput(ctx);
            const param = this.parameter.join(".");
            if (typeof originalInput === "undefined") {
                if (this.isOptional.value) {
                    return null;
                }
                return new ValidationResult_1.default(param, undefined, [
                    {
                        param,
                        location: this.location,
                        msg: "Missing value",
                        value: "",
                    },
                ]);
            }
            else if (originalInput === null) {
                if (this.isOptional.options && this.isOptional.options.allowNull) {
                    return null;
                }
                return new ValidationResult_1.default(param, undefined, [
                    { param, location: this.location, msg: "Invalid value", value: null },
                ]);
            }
            let input = originalInput + "";
            const errors = yield this.operations.reduce((arrP, current) => __awaiter(this, void 0, void 0, function* () {
                const arr = yield arrP;
                if (isSanitation(current)) {
                    // If some of the validations have failed, we can't do any sanitations
                    if (arr.length) {
                        return arr;
                    }
                    input = this.sanitize(input, current);
                    return arr;
                }
                const { message } = current;
                const finalMessage = typeof message === "function" ? message(ctx, input) : message;
                if (current.validation === "custom") {
                    try {
                        yield current.func(input, ctx);
                    }
                    catch (e) {
                        arr.push({
                            msg: finalMessage !== null && finalMessage !== void 0 ? finalMessage : (e instanceof Error && e.message
                                ? e.message
                                : this.defaultErrorMessage),
                            location: this.location,
                            param,
                            value: originalInput + "",
                        });
                    }
                }
                else if (!validator_1.default[current.validation](input, current.options)) {
                    arr.push({
                        msg: finalMessage || this.defaultErrorMessage,
                        location: this.location,
                        param,
                        value: originalInput + "",
                    });
                }
                return arr;
            }), Promise.resolve([]));
            return new ValidationResult_1.default(param, errors.length ? undefined : input, errors);
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
    addValidation(definition) {
        if (this.hasNonStringSanitizer) {
            throw new Error("Validations cannot be done after using sanitizers that convert the type of input to non-string value");
        }
        this.operations.push(definition);
        return this;
    }
    addSanitation(definition, nonStringOutput) {
        if (nonStringOutput) {
            this.hasNonStringSanitizer = true;
        }
        this.operations.push(definition);
        return this;
    }
}
exports.default = ValidationChain;
const isSanitation = (definition) => definition.type === "sanitation";
//# sourceMappingURL=ValidationChain.js.map