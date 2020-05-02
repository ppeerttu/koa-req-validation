import { RouterContext } from "@koa/router";
import validator from "validator";

import { IValidationState } from "..";
import {
    CustomErrorMessageFunction,
    CustomValidatorFunction,
    IOptionalOptions,
    ISanitationDefinition,
    IValidationDefinition,
    IValidationError,
    ParamLocation,
} from "./types";
import ValidationResult from "./ValidationResult";

/**
 * The validation chain object.
 */
export default class ValidationChain {
    /**
     * Default error message when validation fails.
     */
    public readonly defaultErrorMessage = "Invalid value";

    /**
     * Parameter to be validated.
     */
    private parameter: string;

    /**
     * Validations and sanitations to be executed.
     */
    private operations: (IValidationDefinition | ISanitationDefinition)[] = [];

    /**
     * Location of the given parameter.
     */
    private location: ParamLocation;

    /**
     * Is this parameter optional?
     */
    private isOptional: {
        value: boolean;
        options?: IOptionalOptions;
    } = { value: false };

    /**
     * Create a new ValidationChain.
     *
     * @param parameter Name of the parameter to validate
     * @param location Location of the parameter in request
     */
    constructor(parameter: string, location: ParamLocation) {
        this.parameter = parameter;
        if (!Object.values(ParamLocation).includes(location)) {
            throw new TypeError(
                `Param location has to be one of ` +
                    Object.values(ParamLocation).join(", ") +
                    ` but received ${location}`
            );
        }
        this.location = location;
    }

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
    public build = () => async (
        ctx: RouterContext<IValidationState>,
        next: () => Promise<void>
    ) => {
        const results = await this.checkResults(ctx);
        if (results) {
            if (Array.isArray(ctx.state.validationResults)) {
                ctx.state.validationResults.push(results);
            } else {
                ctx.state.validationResults = [results];
            }
        }
        await next();
    };

    /**
     * @deprecated Use `build()` instead
     */
    public run = () => {
        console.warn("ValidationChain.run() is deprecated. Please use .build() instead.");
        return this.build();
    };

    /**
     * Pass a custom message to the validation.
     *
     * @param message Custom message
     *
     * @throws {Error} No validation has been set before `withMessage()` has been called
     */
    public withMessage(message: string | CustomErrorMessageFunction) {
        if (this.operations.length < 1) {
            throw new Error(
                `Can't set a validation error message using withMessage() when ` +
                    `no validations have been defined`
            );
        }
        const validationDefinition = this.operations[this.operations.length - 1];
        if (validationDefinition.type === "sanitation") {
            throw new Error(
                `Can't set a validation error message using withMessage() ` +
                    `to a sanitizer definition! Please call withMessage() immediately after ` +
                    `the validation definition.`
            );
        }
        validationDefinition.message = message;
        return this;
    }

    /**
     * Set this property as optional.
     */
    public optional(options?: IOptionalOptions) {
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
    public custom(func: CustomValidatorFunction) {
        if (typeof func === "undefined") {
            throw new TypeError(
                `Expected to receive a custom validation function but received: ${func}`
            );
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
    public contains(seed: string) {
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
    public equals(comparison: string) {
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
    public isInt(options?: validator.IsIntOptions) {
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
    public isLength(options: validator.IsLengthOptions) {
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
    public isEmail(options?: validator.IsEmailOptions) {
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
    public isBoolean() {
        this.operations.push({
            type: "validation",
            validation: "isBoolean",
        });
        return this;
    }

    /**
     * Check if the parameter is a zero length string.
     */
    public isEmpty(options?: validator.IsEmptyOptions) {
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
    public isFloat(options?: validator.IsFloatOptions) {
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
    public isHash(algorithm: validator.HashAlgorithm) {
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
    public isJWT() {
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
    public isJSON() {
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
    public isLatLong() {
        this.operations.push({
            type: "validation",
            validation: "isLatLong",
        });
        return this;
    }

    /**
     * Check if the paramter contains only lowercase characters.
     */
    public isLowercase() {
        this.operations.push({
            type: "validation",
            validation: "isLowercase",
        });
        return this;
    }

    /**
     * Check if the parameter is a MAC address.
     */
    public isMACAddress(options?: validator.IsMACAddressOptions) {
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
    public isMongoId() {
        this.operations.push({
            type: "validation",
            validation: "isMongoId",
        });
        return this;
    }

    /**
     * Check if the parameter contains only numbers.
     */
    public isNumeric(options?: validator.IsNumericOptions) {
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
    public isPort() {
        this.operations.push({
            type: "validation",
            validation: "isPort",
        });
        return this;
    }

    /**
     * Check if the parameter is valid UUID (v3, v4 or v5).
     */
    public isUUID(version?: 3 | 4 | 5 | "3" | "4" | "5" | "all") {
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
    public isUppercase() {
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
    public matches(regExp: RegExp) {
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
    public isIn(values: any[]) {
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
    public isAfter(date?: string) {
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
    public isAlpha(locale?: validator.AlphaLocale) {
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
    public isAlphanumeric(locale?: validator.AlphanumericLocale) {
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
    public isAscii() {
        this.operations.push({
            type: "validation",
            validation: "isAscii",
        });
        return this;
    }

    /**
     * Check if the string is base64 encoded.
     */
    public isBase64() {
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
    public isBefore(date?: string) {
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
    public isByteLength(options: validator.IsByteLengthOptions = { min: 0 }) {
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
    public isCreditCard() {
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
    public isCurrency(options?: validator.IsCurrencyOptions) {
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
    public isDataURI() {
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
    public isDecimal(options?: validator.IsDecimalOptions) {
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
    public isDivisibleBy(division: number) {
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
    public isFQDN(options?: validator.IsFQDNOptions) {
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
    public isFullWidth() {
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
    public isHalfWidth() {
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
    public isHexColor() {
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
    public isHexadecimal() {
        this.operations.push({
            type: "validation",
            validation: "isHexadecimal",
        });
        return this;
    }

    /**
     * Check if the string is an IP (ver 4 or 6).
     */
    public isIP(version?: 4 | 6 | "4" | "6") {
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
    public isIPRange() {
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
    public isISBN(version: 10 | 13 | "10" | "13") {
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
    public isISSN(options?: validator.IsISSNOptions) {
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
    public isISIN() {
        this.operations.push({
            type: "validation",
            validation: "isISIN",
        });
        return this;
    }

    /**
     * Check if the string is valid ISO8601 date.
     */
    public isISO8601(options?: validator.IsISO8601Options) {
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
    public isRFC3339() {
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
    public isISO31661Alpha2() {
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
    public isISO31661Alpha3() {
        this.operations.push({
            type: "validation",
            validation: "isISO31661Alpha3",
        });
        return this;
    }

    /**
     * Check if the string is a ISRC.
     */
    public isISRC() {
        this.operations.push({
            type: "validation",
            validation: "isISRC",
        });
        return this;
    }

    /**
     * Check if the string is a MD5 hash.
     */
    public isMD5() {
        this.operations.push({
            type: "validation",
            validation: "isMD5",
        });
        return this;
    }

    /**
     * Check if the string is a valid MIME type format.
     */
    public isMimeType() {
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
    public isMobilePhone(
        locale:
            | validator.MobilePhoneLocale
            | validator.MobilePhoneLocale[]
            | "any" = "any"
    ) {
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
    public isMultibyte() {
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
    public isPostalCode(locale: validator.PostalCodeLocale | "any" = "any") {
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
    public isSurrogatePair() {
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
    public isURL(options?: validator.IsURLOptions) {
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
    public isVariableWidth() {
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
    public isWhitelisted(chars: string | string[]) {
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
    public blacklist(chars: string) {
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
    public escape() {
        this.operations.push({
            type: "sanitation",
            sanitation: "escape",
        });
        return this;
    }

    /**
     * Replaces HTML encoded entities with <, >, &, ", ' and /.
     */
    public unescape() {
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
    public ltrim(chars?: string) {
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
    public rtrim(chars?: string) {
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
    public normalizeEmail(options?: validator.NormalizeEmailOptions) {
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
    public stripLow(keepNewLines: boolean = false) {
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
    public toBoolean(strict = false) {
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
    public toDate() {
        this.operations.push({
            type: "sanitation",
            sanitation: "toDate",
        });
        return this;
    }

    /**
     * Convert the input string to a float.
     */
    public toFloat() {
        this.operations.push({
            type: "sanitation",
            sanitation: "toFloat",
        });
        return this;
    }

    /**
     * Convert the input string to an integer, or NaN if the input is not an integer.
     */
    public toInt(radix: number = 10) {
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
    public trim(chars?: string) {
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
    public whitelist(chars: string) {
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
    private async checkResults(
        ctx: RouterContext<IValidationState>
    ): Promise<ValidationResult | null> {
        let input: any;
        let originalInput: any;

        switch (this.location) {
            case ParamLocation.BODY:
                input = ctx.request.body[this.parameter];
                break;
            case ParamLocation.PARAM:
                input = ctx.params[this.parameter];
                break;
            case ParamLocation.QUERY:
                input = ctx.query[this.parameter];
                break;
        }

        originalInput = input;

        if (typeof input === "undefined") {
            if (this.isOptional.value) {
                return null;
            }
            input = null;
        } else if (input === null) {
            if (this.isOptional.options && this.isOptional.options.allowNull) {
                return null;
            }
        } else {
            input = input.toString();
        }

        const errors = await this.operations.reduce(
            async (arrP: Promise<IValidationError[]>, current) => {
                const arr = await arrP;
                const { type } = current;

                if (type === "sanitation" && input !== null) {
                    // If some of the validations has failed, we can't do any sanitations
                    if (arr.length) {
                        return arr;
                    }
                    input = this.sanitize(input, current as ISanitationDefinition);
                    return arr;
                }

                const {
                    validation,
                    options,
                    message,
                    func,
                } = current as IValidationDefinition;

                const finalMessage: string | undefined =
                    typeof message === "function"
                        ? message(ctx, input === null ? "" : input + "")
                        : message;

                if (validation === "custom") {
                    try {
                        await func!(input, ctx);
                    } catch (e) {
                        arr.push({
                            msg: finalMessage || e.message || this.defaultErrorMessage,
                            location: this.location,
                            param: this.parameter,
                            value: originalInput + "",
                        });
                    }

                    // @ts-ignore
                } else if (input === null || !validator[validation](input, options)) {
                    arr.push({
                        msg: finalMessage || this.defaultErrorMessage,
                        location: this.location,
                        param: this.parameter,
                        value: originalInput + "",
                    });
                }

                return arr;
            },
            Promise.resolve([])
        );

        return new ValidationResult(
            this.parameter,
            errors.length ? undefined : input,
            errors
        );
    }

    /**
     * Sanitize the given input value with given sanitation definition.
     *
     * @param input The input as string
     */
    private sanitize(input: string, sanitationDefinition: ISanitationDefinition): any {
        const { sanitation, options } = sanitationDefinition;
        const fn = validator[sanitation] as (input: string, options?: any) => any;
        return fn(input, options);
    }
}
