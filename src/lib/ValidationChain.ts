import { RouterContext, Middleware } from "@koa/router";
import validator from "validator";

import {
    CustomErrorMessageFunction,
    CustomValidatorFunction,
    ICustomValidationDefinition,
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
    private parameter: string[];

    /**
     * Validations and sanitations to be executed.
     */
    private operations: (
        | IValidationDefinition
        | ICustomValidationDefinition
        | ISanitationDefinition
    )[] = [];

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

    private hasNonStringSanitizer = false;

    /**
     * Create a new ValidationChain.
     *
     * @param parameter Name of the parameter to validate
     * @param location Location of the parameter in request
     */
    constructor(parameter: string, location: ParamLocation) {
        this.parameter = parameter.split(".");
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
    public build =
        (): Middleware =>
        async (ctx: RouterContext, next: () => Promise<void>): Promise<void> => {
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
    public run = (): Middleware => {
        // eslint-disable-next-line no-console
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
    public withMessage(message: string | CustomErrorMessageFunction): ValidationChain {
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
    public optional(options?: IOptionalOptions): ValidationChain {
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
    public custom(func: CustomValidatorFunction): ValidationChain {
        if (typeof func !== "function") {
            throw new TypeError(
                `Expected to receive a custom validation function but received: ${func}`
            );
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
    public contains(seed: string): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "contains",
            options: seed,
        });
    }

    /**
     * Check if the request property equals the given comparison.
     */
    public equals(comparison: string): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "equals",
            options: comparison,
        });
    }

    /**
     * Check if the parameter is an integer.
     */
    public isInt(options?: validator.IsIntOptions): ValidationChain {
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
    public isLength(options: validator.IsLengthOptions): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isLength",
            options,
        });
    }

    /**
     * Check if the parameter is an email.
     */
    public isEmail(options?: validator.IsEmailOptions): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isEmail",
            options,
        });
    }

    /**
     * Check if the parameter is a boolean value.
     */
    public isBoolean(): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isBoolean",
        });
    }

    /**
     * Check if the parameter is a zero length string.
     */
    public isEmpty(options?: validator.IsEmptyOptions): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isEmpty",
            options,
        });
    }

    /**
     * Check if the parameter is a float.
     */
    public isFloat(options?: validator.IsFloatOptions): ValidationChain {
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
    public isHash(algorithm: validator.HashAlgorithm): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isHash",
            options: algorithm,
        });
    }

    /**
     * Check if the parameter is a valid JWT token.
     */
    public isJWT(): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isJWT",
        });
    }

    /**
     * Check if the parameter is a valid JSON. Uses
     * `JSON.parse`.
     */
    public isJSON(): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isJSON",
        });
    }

    /**
     * Check if the parameter is a latitude-lognitude coordinate
     * in the format `lat,long` or `lat, long`.
     */
    public isLatLong(): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isLatLong",
        });
    }

    /**
     * Check if the paramter contains only lowercase characters.
     */
    public isLowercase(): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isLowercase",
        });
    }

    /**
     * Check if the parameter is a MAC address.
     */
    public isMACAddress(options?: validator.IsMACAddressOptions): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isMACAddress",
            options,
        });
    }

    /**
     * Check if the parameter is a valid MongoDB ObjectId.
     */
    public isMongoId(): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isMongoId",
        });
    }

    /**
     * Check if the parameter contains only numbers.
     */
    public isNumeric(options?: validator.IsNumericOptions): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isNumeric",
            options,
        });
    }

    /**
     * Check if the parameter is a valid port number.
     */
    public isPort(): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isPort",
        });
    }

    /**
     * Check if the parameter is valid UUID (v3, v4 or v5).
     */
    public isUUID(version?: 3 | 4 | 5 | "3" | "4" | "5" | "all"): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isUUID",
            options: version,
        });
    }

    /**
     * Check if the parameter contains only uppercase characters.
     */
    public isUppercase(): ValidationChain {
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
    public matches(regExp: RegExp): ValidationChain {
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
    public isIn(values: string[]): ValidationChain {
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
    public isAfter(date?: string): ValidationChain {
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
    public isAlpha(locale?: validator.AlphaLocale): ValidationChain {
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
    public isAlphanumeric(locale?: validator.AlphanumericLocale): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isAlphanumeric",
            options: locale,
        });
    }

    /**
     * Check if the string contains ASCII characters only.
     */
    public isAscii(): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isAscii",
        });
    }

    /**
     * Check if the string is base64 encoded.
     */
    public isBase64(): ValidationChain {
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
    public isBefore(date?: string): ValidationChain {
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
    public isByteLength(
        options: validator.IsByteLengthOptions = { min: 0 }
    ): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isByteLength",
            options,
        });
    }

    /**
     * Check if the string is a credit card.
     */
    public isCreditCard(): ValidationChain {
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
    public isCurrency(options?: validator.IsCurrencyOptions): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isCurrency",
            options,
        });
    }

    /**
     * Check if the string is a data uri format.
     */
    public isDataURI(): ValidationChain {
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
    public isDecimal(options?: validator.IsDecimalOptions): ValidationChain {
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
    public isDivisibleBy(division: number): ValidationChain {
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
    public isFQDN(options?: validator.IsFQDNOptions): ValidationChain {
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
    public isFullWidth(): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isFullWidth",
        });
    }

    /**
     * Check if the string contains any half-width
     * chars.
     */
    public isHalfWidth(): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isHalfWidth",
        });
    }

    /**
     * Check if the string is a hexadecimal
     * color.
     */
    public isHexColor(): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isHexColor",
        });
    }

    /**
     * Check if the string is a hexadecimal
     * number.
     */
    public isHexadecimal(): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isHexadecimal",
        });
    }

    /**
     * Check if the string is an IP (ver 4 or 6).
     */
    public isIP(version?: 4 | 6 | "4" | "6"): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isIP",
            options: version,
        });
    }

    /**
     * Check if the string is an IP range (ver 4 only).
     */
    public isIPRange(): ValidationChain {
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
    public isISBN(version: 10 | 13 | "10" | "13"): ValidationChain {
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
    public isISSN(options?: validator.IsISSNOptions): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isISSN",
            options,
        });
    }

    /**
     * Check if the string is an ISIN.
     */
    public isISIN(): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isISIN",
        });
    }

    /**
     * Check if the string is valid ISO8601 date.
     */
    public isISO8601(options?: validator.IsISO8601Options): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isISO8601",
            options,
        });
    }

    /**
     * Check if the string is valid RFC3339 date.
     */
    public isRFC3339(): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isRFC3339",
        });
    }

    /**
     * Check if the string is a valid ISO 3166-1 alpha-2
     * officially assigned country code.
     */
    public isISO31661Alpha2(): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isISO31661Alpha2",
        });
    }

    /**
     * Check if the string is a valid ISO 3166-1 alpha-3
     * officially assigned country code.
     */
    public isISO31661Alpha3(): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isISO31661Alpha3",
        });
    }

    /**
     * Check if the string is a ISRC.
     */
    public isISRC(): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isISRC",
        });
    }

    /**
     * Check if the string is a MD5 hash.
     */
    public isMD5(): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isMD5",
        });
    }

    /**
     * Check if the string is a valid MIME type format.
     */
    public isMimeType(): ValidationChain {
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
    public isMobilePhone(
        locale:
            | validator.MobilePhoneLocale
            | validator.MobilePhoneLocale[]
            | "any" = "any"
    ): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isMobilePhone",
            options: locale,
        });
    }

    /**
     * Check if the string contains one or more multibyte chars.
     */
    public isMultibyte(): ValidationChain {
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
    public isPostalCode(
        locale: validator.PostalCodeLocale | "any" = "any"
    ): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isPostalCode",
            options: locale,
        });
    }

    /**
     * Check if the string contains any surrogate pairs chars.
     */
    public isSurrogatePair(): ValidationChain {
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
    public isURL(options?: validator.IsURLOptions): ValidationChain {
        return this.addValidation({
            type: "validation",
            validation: "isURL",
            options,
        });
    }

    /**
     * Check if the string contains a mixture of full and half-width chars.
     */
    public isVariableWidth(): ValidationChain {
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
    public isWhitelisted(chars: string | string[]): ValidationChain {
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
    public blacklist(chars: string): ValidationChain {
        return this.addSanitation({
            type: "sanitation",
            sanitation: "blacklist",
            options: chars,
        });
    }

    /**
     * Replace <, >, &, ', ' and / with HTML entities.
     */
    public escape(): ValidationChain {
        return this.addSanitation({
            type: "sanitation",
            sanitation: "escape",
        });
    }

    /**
     * Replaces HTML encoded entities with <, >, &, ", ' and /.
     */
    public unescape(): ValidationChain {
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
    public ltrim(chars?: string): ValidationChain {
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
    public rtrim(chars?: string): ValidationChain {
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
    public normalizeEmail(options?: validator.NormalizeEmailOptions): ValidationChain {
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
    public stripLow(keepNewLines = false): ValidationChain {
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
    public toBoolean(strict = false): ValidationChain {
        return this.addSanitation(
            {
                type: "sanitation",
                sanitation: "toBoolean",
                options: strict,
            },
            true
        );
    }

    /**
     * Convert the input string to a date.
     */
    public toDate(): ValidationChain {
        return this.addSanitation(
            {
                type: "sanitation",
                sanitation: "toDate",
            },
            true
        );
    }

    /**
     * Convert the input string to a float.
     */
    public toFloat(): ValidationChain {
        return this.addSanitation(
            {
                type: "sanitation",
                sanitation: "toFloat",
            },
            true
        );
    }

    /**
     * Convert the input string to an integer, or NaN if the input is not an integer.
     */
    public toInt(radix = 10): ValidationChain {
        return this.addSanitation(
            {
                type: "sanitation",
                sanitation: "toInt",
                options: radix,
            },
            true
        );
    }

    /**
     * Trim characters (whitespace by default) from both sides of the input.
     *
     * @param chars The characters to trim
     */
    public trim(chars?: string): ValidationChain {
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
    public whitelist(chars: string): ValidationChain {
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
    private async checkResults(ctx: RouterContext): Promise<ValidationResult | null> {
        const originalInput = this.getOriginalInput(ctx);
        const param = this.parameter.join(".");

        if (typeof originalInput === "undefined") {
            if (this.isOptional.value) {
                return null;
            }
            return new ValidationResult(param, undefined, [
                {
                    param,
                    location: this.location,
                    msg: "Missing value",
                    value: "",
                },
            ]);
        } else if (originalInput === null) {
            if (this.isOptional.options && this.isOptional.options.allowNull) {
                return null;
            }
            return new ValidationResult(param, undefined, [
                { param, location: this.location, msg: "Invalid value", value: null },
            ]);
        }
        let input = originalInput + "";

        const errors = await this.operations.reduce(
            async (arrP: Promise<IValidationError[]>, current) => {
                const arr = await arrP;

                if (isSanitation(current)) {
                    // If some of the validations have failed, we can't do any sanitations
                    if (arr.length) {
                        return arr;
                    }
                    input = this.sanitize(input, current) as string;
                    return arr;
                }

                const { message } = current;

                const finalMessage: string | undefined =
                    typeof message === "function" ? message(ctx, input) : message;

                if (current.validation === "custom") {
                    try {
                        await current.func(input, ctx);
                    } catch (e) {
                        arr.push({
                            msg:
                                finalMessage ??
                                (e instanceof Error && e.message
                                    ? e.message
                                    : this.defaultErrorMessage),
                            location: this.location,
                            param,
                            value: originalInput + "",
                        });
                    }
                } else if (!validator[current.validation](input, current.options)) {
                    arr.push({
                        msg: finalMessage || this.defaultErrorMessage,
                        location: this.location,
                        param,
                        value: originalInput + "",
                    });
                }

                return arr;
            },
            Promise.resolve([])
        );

        return new ValidationResult(param, errors.length ? undefined : input, errors);
    }

    /**
     * Get original input as it is from the request body.
     *
     * @param ctx The context
     */
    private getOriginalInput(ctx: RouterContext): unknown {
        let obj: unknown;
        switch (this.location) {
            case ParamLocation.BODY:
                obj = ctx.request.body;
                break;
            case ParamLocation.PARAM:
                obj = ctx.params;
                break;
            case ParamLocation.QUERY:
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
    private getParamFromObject(object: unknown): unknown {
        return this.parameter.reduce((prev, current) => {
            if (typeof prev === "object" && prev) {
                return (prev as Record<string, unknown>)[current];
            }
            return undefined;
        }, object);
    }

    /**
     * Sanitize the given input value with given sanitation definition.
     *
     * @param input The input as string
     */
    private sanitize(
        input: string,
        sanitationDefinition: ISanitationDefinition
    ): unknown {
        const { sanitation, options } = sanitationDefinition;
        const fn = validator[sanitation] as (input: string, options?: unknown) => unknown;
        return fn(input, options);
    }

    private addValidation(
        definition: IValidationDefinition | ICustomValidationDefinition
    ): ValidationChain {
        if (this.hasNonStringSanitizer) {
            throw new Error(
                "Validations cannot be done after using sanitizers that convert the type of input to non-string value"
            );
        }
        this.operations.push(definition);
        return this;
    }

    private addSanitation(
        definition: ISanitationDefinition,
        nonStringOutput?: boolean
    ): ValidationChain {
        if (nonStringOutput) {
            this.hasNonStringSanitizer = true;
        }
        this.operations.push(definition);
        return this;
    }
}

const isSanitation = (
    definition:
        | IValidationDefinition
        | ICustomValidationDefinition
        | ISanitationDefinition
): definition is ISanitationDefinition => definition.type === "sanitation";
