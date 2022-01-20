import { Middleware as RequestMiddleware, RouterContext } from "@koa/router";
import validator from "validator";
import {
    CustomErrorMessageFunction,
    CustomValidatorFunction,
    CustomValidatorFunctionWithContext,
    IOptionalOptions,
    IValidationError,
    ParamLocation,
} from "./types";
import ValidationResult from "./ValidationResult";

/**
 * Validation definition for internal module usage.
 */
interface IValidationDefinition {
    /**
     * Just a helper type for separating validation definitions from
     * sanitation definitions.
     */
    type: "validation";

    /**
     * Validation function
     */
    validation: ValidatorFunctionName;

    /**
     * Message for invalid value
     */
    message?: string | CustomErrorMessageFunction;

    /**
     * Options for validation function
     */
    options?: unknown;

    /**
     * Custom validation function
     */
    func?: CustomValidatorFunction | CustomValidatorFunctionWithContext;
}

/**
 * Sanitation definition.
 */
interface ISanitationDefinition {
    /**
     * Just a type helper for separating sanitation definitions from
     * validation definitions
     */
    type: "sanitation";

    /**
     * The sanitation function name
     */
    sanitation: SanitationFunctionName;

    /**
     * Options for the sanitation
     */
    options?: unknown;
}

type SanitationResult = string | number | boolean | Date;

/**
 * Allowed validation function name. This is the available list
 * of validators in the validator.js -module.
 */
type ValidatorFunctionName =
    | "custom"
    | "contains"
    | "equals"
    | "isAfter"
    | "isAlpha"
    | "isAlphanumeric"
    | "isAscii"
    | "isBase64"
    | "isBefore"
    | "isBoolean"
    | "isByteLength"
    | "isCreditCard"
    | "isCurrency"
    | "isDataURI"
    | "isMagnetURI" // Not found from validatorjs static type interface
    | "isDecimal"
    | "isDivisibleBy"
    | "isEmail"
    | "isEmpty"
    | "isFQDN"
    | "isFloat"
    | "isFullWidth"
    | "isHalfWidth"
    | "isHash"
    | "isHexColor"
    | "isHexadecimal"
    | "isIdentityCard" // Not found from validatorjs static type interface
    | "isIP"
    | "isIPRange"
    | "isISBN"
    | "isISSN"
    | "isISIN"
    | "isISO8601"
    | "isRFC3339"
    | "isISO31661Alpha2"
    | "isISO31661Alpha3"
    | "isISRC"
    | "isIn"
    | "isInt"
    | "isJSON"
    | "isJWT"
    | "isLatLong"
    | "isLength"
    | "isLowercase"
    | "isMACAddress"
    | "isMD5"
    | "isMimeType"
    | "isMobilePhone"
    | "isMongoId"
    | "isMultibyte"
    | "isNumeric"
    | "isPort"
    | "isPostalCode"
    | "isSurrogatePair"
    | "isURL"
    | "isUUID"
    | "isUppercase"
    | "isVariableWidth"
    | "isWhitelisted"
    | "matches";

/**
 * Allowed sanitation functions by validator.
 */
type SanitationFunctionName =
    | "blacklist"
    | "escape"
    | "unescape"
    | "ltrim"
    | "normalizeEmail"
    | "rtrim"
    | "stripLow"
    | "toBoolean"
    | "toDate"
    | "toFloat"
    | "toInt"
    | "trim"
    | "whitelist";

const isSanitation = (
    operation: IValidationDefinition | ISanitationDefinition
): operation is ISanitationDefinition => operation.type === "sanitation";

/**
 * The validation chain object.
 */
export default class ValidationChain<Middleware> {
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

    public middleware!: Middleware;

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

    public handleRequest: RequestMiddleware = async (
        ctx: RouterContext,
        next: () => Promise<void>
    ): Promise<void> => {
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
     * Pass a custom message to the validation.
     *
     * @param message Custom message
     *
     * @throws {Error} No validation has been set before `withMessage()` has been called
     */
    public withMessage(message: string | CustomErrorMessageFunction): Middleware {
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
        return this.middleware;
    }

    /**
     * Set this property as optional.
     */
    public optional(options?: IOptionalOptions): Middleware {
        this.isOptional = {
            value: true,
            options,
        };
        return this.middleware;
    }

    /**
     * Custom async validation function to execute. The function
     * must throw when the validation fails.
     *
     * @param func The validation function
     */
    public custom(func: CustomValidatorFunction): Middleware {
        if (typeof func !== "function") {
            throw new TypeError(
                `Expected to receive a custom validation function but received: ${func}`
            );
        }
        this.operations.push({
            type: "validation",
            validation: "custom",
            func,
        });
        return this.middleware;
    }

    /**
     * Check if the request property contains the given seed.
     */
    public contains(seed: string): Middleware {
        this.operations.push({
            type: "validation",
            validation: "contains",
            options: seed,
        });
        return this.middleware;
    }

    /**
     * Check if the request property equals the given comparison.
     */
    public equals(comparison: string): Middleware {
        this.operations.push({
            type: "validation",
            validation: "equals",
            options: comparison,
        });
        return this.middleware;
    }

    /**
     * Check if the parameter is an integer.
     */
    public isInt(options?: validator.IsIntOptions): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isInt",
            options,
        });
        return this.middleware;
    }

    /**
     * Check if the string is in given length.
     *
     * @param options Min and max length
     */
    public isLength(options: validator.IsLengthOptions): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isLength",
            options,
        });
        return this.middleware;
    }

    /**
     * Check if the parameter is an email.
     */
    public isEmail(options?: validator.IsEmailOptions): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isEmail",
            options,
        });
        return this.middleware;
    }

    /**
     * Check if the parameter is a boolean value.
     */
    public isBoolean(): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isBoolean",
        });
        return this.middleware;
    }

    /**
     * Check if the parameter is a zero length string.
     */
    public isEmpty(options?: validator.IsEmptyOptions): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isEmpty",
            options,
        });
        return this.middleware;
    }

    /**
     * Check if the parameter is a float.
     */
    public isFloat(options?: validator.IsFloatOptions): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isFloat",
            options,
        });
        return this.middleware;
    }

    /**
     * Check if the parameter is an algorithm.
     *
     * @param algorithm The algorithm
     */
    public isHash(algorithm: validator.HashAlgorithm): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isHash",
            options: algorithm,
        });
        return this.middleware;
    }

    /**
     * Check if the parameter is a valid JWT token.
     */
    public isJWT(): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isJWT",
        });
        return this.middleware;
    }

    /**
     * Check if the parameter is a valid JSON. Uses
     * `JSON.parse`.
     */
    public isJSON(): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isJSON",
        });
        return this.middleware;
    }

    /**
     * Check if the parameter is a latitude-lognitude coordinate
     * in the format `lat,long` or `lat, long`.
     */
    public isLatLong(): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isLatLong",
        });
        return this.middleware;
    }

    /**
     * Check if the paramter contains only lowercase characters.
     */
    public isLowercase(): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isLowercase",
        });
        return this.middleware;
    }

    /**
     * Check if the parameter is a MAC address.
     */
    public isMACAddress(options?: validator.IsMACAddressOptions): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isMACAddress",
            options,
        });
        return this.middleware;
    }

    /**
     * Check if the parameter is a valid MongoDB ObjectId.
     */
    public isMongoId(): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isMongoId",
        });
        return this.middleware;
    }

    /**
     * Check if the parameter contains only numbers.
     */
    public isNumeric(options?: validator.IsNumericOptions): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isNumeric",
            options,
        });
        return this.middleware;
    }

    /**
     * Check if the parameter is a valid port number.
     */
    public isPort(): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isPort",
        });
        return this.middleware;
    }

    /**
     * Check if the parameter is valid UUID (v3, v4 or v5).
     */
    public isUUID(version?: 3 | 4 | 5 | "3" | "4" | "5" | "all"): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isUUID",
            options: version,
        });
        return this.middleware;
    }

    /**
     * Check if the parameter contains only uppercase characters.
     */
    public isUppercase(): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isUppercase",
        });
        return this.middleware;
    }

    /**
     * Check if the parameter matches given regular expression.
     *
     * @param regExp The regular expression
     */
    public matches(regExp: RegExp): Middleware {
        this.operations.push({
            type: "validation",
            validation: "matches",
            options: regExp,
        });
        return this.middleware;
    }

    /**
     * Check if the parameter is some of the allowed
     * values.
     *
     * @param values Options containing at least `values`
     * property with allowed values
     */
    public isIn(values: string[]): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isIn",
            options: values,
        });
        return this.middleware;
    }

    /**
     * Check if the string is a date that's after the specified
     * date (defaults to now).
     *
     * @param date The date (defaults to now)
     */
    public isAfter(date?: string): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isAfter",
            options: date,
        });
        return this.middleware;
    }

    /**
     * Check if the string contains only letters. Locale
     * defaults to en-US.
     *
     * @param locale The locale
     */
    public isAlpha(locale?: validator.AlphaLocale): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isAlpha",
            options: locale,
        });
        return this.middleware;
    }

    /**
     * Check if the string contains only letters and numbers.
     * Locale defaults to en-US.
     *
     * @param locale The locale
     */
    public isAlphanumeric(locale?: validator.AlphanumericLocale): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isAlphanumeric",
            options: locale,
        });
        return this.middleware;
    }

    /**
     * Check if the string contains ASCII characters only.
     */
    public isAscii(): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isAscii",
        });
        return this.middleware;
    }

    /**
     * Check if the string is base64 encoded.
     */
    public isBase64(): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isBase64",
        });
        return this.middleware;
    }

    /**
     * Check if the string is a date that's before
     * the given date, which defaults to now.
     *
     * @param date The date (defaults to now)
     */
    public isBefore(date?: string): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isBefore",
            options: date,
        });
        return this.middleware;
    }

    /**
     * Check if the strin's length (in UTF-8 bytes)
     * falls in range.
     *
     * @param options The range
     */
    public isByteLength(options: validator.IsByteLengthOptions = { min: 0 }): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isByteLength",
            options,
        });
        return this.middleware;
    }

    /**
     * Check if the string is a credit card.
     */
    public isCreditCard(): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isCreditCard",
        });
        return this.middleware;
    }

    /**
     * Check if the string is a valid currency amount.
     *
     * @param options The options
     */
    public isCurrency(options?: validator.IsCurrencyOptions): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isCurrency",
            options,
        });
        return this.middleware;
    }

    /**
     * Check if the string is a data uri format.
     */
    public isDataURI(): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isDataURI",
        });
        return this.middleware;
    }

    /**
     * Check if the string represents a decimal number.
     *
     * @param options The options
     */
    public isDecimal(options?: validator.IsDecimalOptions): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isDecimal",
            options,
        });
        return this.middleware;
    }

    /**
     * Check if the string is a number divisible by
     * given number.
     *
     * @param division The division number
     */
    public isDivisibleBy(division: number): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isDivisibleBy",
            options: division,
        });
        return this.middleware;
    }

    /**
     * Check if the string is fully qualified
     * domain name.
     *
     * @param options The options
     */
    public isFQDN(options?: validator.IsFQDNOptions): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isFQDN",
            options,
        });
        return this.middleware;
    }

    /**
     * Check if the string contains any full-width
     * chars.
     */
    public isFullWidth(): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isFullWidth",
        });
        return this.middleware;
    }

    /**
     * Check if the string contains any half-width
     * chars.
     */
    public isHalfWidth(): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isHalfWidth",
        });
        return this.middleware;
    }

    /**
     * Check if the string is a hexadecimal
     * color.
     */
    public isHexColor(): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isHexColor",
        });
        return this.middleware;
    }

    /**
     * Check if the string is a hexadecimal
     * number.
     */
    public isHexadecimal(): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isHexadecimal",
        });
        return this.middleware;
    }

    /**
     * Check if the string is an IP (ver 4 or 6).
     */
    public isIP(version?: 4 | 6 | "4" | "6"): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isIP",
            options: version,
        });
        return this.middleware;
    }

    /**
     * Check if the string is an IP range (ver 4 only).
     */
    public isIPRange(): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isIPRange",
        });
        return this.middleware;
    }

    /**
     * Check if the string is an ISBN.
     *
     * @param version The version
     */
    public isISBN(version: 10 | 13 | "10" | "13"): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isISBN",
            options: version,
        });
        return this.middleware;
    }

    /**
     * Check if the string is an ISSN.
     *
     * @param options The options
     */
    public isISSN(options?: validator.IsISSNOptions): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isISSN",
            options,
        });
        return this.middleware;
    }

    /**
     * Check if the string is an ISIN.
     */
    public isISIN(): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isISIN",
        });
        return this.middleware;
    }

    /**
     * Check if the string is valid ISO8601 date.
     */
    public isISO8601(options?: validator.IsISO8601Options): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isISO8601",
            options,
        });
        return this.middleware;
    }

    /**
     * Check if the string is valid RFC3339 date.
     */
    public isRFC3339(): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isRFC3339",
        });
        return this.middleware;
    }

    /**
     * Check if the string is a valid ISO 3166-1 alpha-2
     * officially assigned country code.
     */
    public isISO31661Alpha2(): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isISO31661Alpha2",
        });
        return this.middleware;
    }

    /**
     * Check if the string is a valid ISO 3166-1 alpha-3
     * officially assigned country code.
     */
    public isISO31661Alpha3(): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isISO31661Alpha3",
        });
        return this.middleware;
    }

    /**
     * Check if the string is a ISRC.
     */
    public isISRC(): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isISRC",
        });
        return this.middleware;
    }

    /**
     * Check if the string is a MD5 hash.
     */
    public isMD5(): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isMD5",
        });
        return this.middleware;
    }

    /**
     * Check if the string is a valid MIME type format.
     */
    public isMimeType(): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isMimeType",
        });
        return this.middleware;
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
    ): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isMobilePhone",
            options: locale,
        });
        return this.middleware;
    }

    /**
     * Check if the string contains one or more multibyte chars.
     */
    public isMultibyte(): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isMultibyte",
        });
        return this.middleware;
    }

    /**
     * Check if the string is a postal code.
     *
     * @param locale The locale to use
     */
    public isPostalCode(locale: validator.PostalCodeLocale | "any" = "any"): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isPostalCode",
            options: locale,
        });
        return this.middleware;
    }

    /**
     * Check if the string contains any surrogate pairs chars.
     */
    public isSurrogatePair(): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isSurrogatePair",
        });
        return this.middleware;
    }

    /**
     * Check if the string is an URL.
     *
     * @param options Possible options
     */
    public isURL(options?: validator.IsURLOptions): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isURL",
            options,
        });
        return this.middleware;
    }

    /**
     * Check if the string contains a mixture of full and half-width chars.
     */
    public isVariableWidth(): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isVariableWidth",
        });
        return this.middleware;
    }

    /**
     * Checks characters if they appear in the whitelist.
     *
     * @param chars The characters
     */
    public isWhitelisted(chars: string | string[]): Middleware {
        this.operations.push({
            type: "validation",
            validation: "isWhitelisted",
            options: chars,
        });
        return this.middleware;
    }

    /**
     * Remove characters that appear in the blacklist. The characters are used in a RegExp
     *  and so you will need to escape some chars, e.g. blacklist(input, '\\[\\]').
     *
     * @param chars Characters to blacklist
     */
    public blacklist(chars: string): Middleware {
        return this.addSanitation("blacklist", chars);
    }

    /**
     * Replace <, >, &, ', ' and / with HTML entities.
     */
    public escape(): Middleware {
        return this.addSanitation("escape");
    }

    /**
     * Replaces HTML encoded entities with <, >, &, ", ' and /.
     */
    public unescape(): Middleware {
        return this.addSanitation("unescape");
    }

    /**
     * Trim characters from the left-side of the input.
     *
     * @param chars The characters to trim
     */
    public ltrim(chars?: string): Middleware {
        return this.addSanitation("ltrim", chars);
    }

    /**
     * Trim characters from the right-side of the input.
     *
     * @param chars The characters to trim
     */
    public rtrim(chars?: string): Middleware {
        return this.addSanitation("rtrim", chars);
    }

    /**
     * Normalize email address.
     *
     * @param options The options
     *
     * @see https://github.com/chriso/validator.js For details
     */
    public normalizeEmail(options?: validator.NormalizeEmailOptions): Middleware {
        return this.addSanitation("normalizeEmail", options);
    }

    /**
     * Remove characters with a numerical value < 32 and 127, mostly control characters.
     * If keep_new_lines is true, newline characters are preserved (\n and \r, hex 0xA
     * and 0xD). Unicode-safe in JavaScript.
     *
     * @param keepNewLines
     */
    public stripLow(keepNewLines = false): Middleware {
        return this.addSanitation("stripLow", keepNewLines);
    }

    /**
     * convert the input string to a boolean. Everything except for '0', 'false' and ''
     * returns true. In strict mode only '1' and 'true' return true.
     */
    public toBoolean(strict = false): Middleware {
        return this.addSanitation("toBoolean", strict);
    }

    /**
     * Convert the input string to a date.
     */
    public toDate(): Middleware {
        return this.addSanitation("toDate");
    }

    /**
     * Convert the input string to a float.
     */
    public toFloat(): Middleware {
        return this.addSanitation("toFloat");
    }

    /**
     * Convert the input string to an integer, or NaN if the input is not an integer.
     */
    public toInt(radix = 10): Middleware {
        return this.addSanitation("toInt", radix);
    }

    /**
     * Trim characters (whitespace by default) from both sides of the input.
     *
     * @param chars The characters to trim
     */
    public trim(chars?: string): Middleware {
        return this.addSanitation("trim", chars);
    }

    /**
     * Remove characters that do not appear in the whitelist. The characters are used in a
     * RegExp and so you will need to escape some chars, e.g. whitelist(input, '\\[\\]').
     *
     * @param chars Characters to whitelist
     */
    public whitelist(chars: string): Middleware {
        return this.addSanitation("whitelist", chars);
    }

    private getNormalizedInput(originalInput: unknown): string | null | undefined {
        if (typeof originalInput === "undefined") {
            if (this.isOptional.value) {
                return undefined;
            }
            return null;
        } else if (originalInput === null) {
            if (this.isOptional.options && this.isOptional.options.allowNull) {
                return undefined;
            }
            return null;
        }
        return originalInput + "";
    }

    /**
     * Run the validations and return the results.
     * @param ctx The context
     */
    private async checkResults(ctx: RouterContext): Promise<ValidationResult | null> {
        const originalInput = this.getOriginalInput(ctx);
        const originalInputStr = originalInput + "";
        const input = this.getNormalizedInput(originalInput);
        if (typeof input === "undefined") {
            return null;
        }
        let sanitizedOutput: undefined | SanitationResult = undefined;

        const errors = await this.operations.reduce(
            async (arrP: Promise<IValidationError[]>, current) => {
                const arr = await arrP;

                if (isSanitation(current)) {
                    // If some of the validations has failed, we can't do any sanitations
                    if (arr.length || typeof input !== "string") {
                        return arr;
                    }
                    sanitizedOutput = this.sanitize(input, current);
                    return arr;
                }

                const { validation, options, message, func } = current;

                const finalMessage: string | undefined =
                    typeof message === "function"
                        ? message(ctx, input === null ? "" : input + "")
                        : message;

                if (validation === "custom") {
                    if (typeof func !== "function") {
                        throw new Error(
                            `Invalid custom function for validation: ${validation}`
                        );
                    }
                    try {
                        await func(input, ctx);
                    } catch (e: unknown) {
                        arr.push({
                            msg:
                                finalMessage ??
                                (e instanceof Error && e.message
                                    ? e.message
                                    : this.defaultErrorMessage),
                            location: this.location,
                            param: this.parameter.join("."),
                            value: originalInputStr,
                        });
                    }
                } else if (input === null || !validator[validation](input, options)) {
                    arr.push({
                        msg: finalMessage || this.defaultErrorMessage,
                        location: this.location,
                        param: this.parameter.join("."),
                        value: originalInputStr,
                    });
                }

                return arr;
            },
            Promise.resolve([])
        );

        const finalValue =
            errors.length > 0 || input === null
                ? undefined
                : typeof sanitizedOutput !== "undefined"
                ? sanitizedOutput
                : input;

        return new ValidationResult(this.parameter.join("."), finalValue, errors);
    }

    /**
     * Get original input as it is from the request body.
     *
     * @param ctx The context
     */
    private getOriginalInput(ctx: RouterContext): unknown {
        let obj: Record<string, unknown>;
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
    private getParamFromObject(object: Record<string, unknown>): unknown {
        return this.parameter.reduce((prev: unknown, current) => {
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
    ): SanitationResult {
        const { sanitation, options } = sanitationDefinition;
        const fn = validator[sanitation] as (
            input: string,
            options?: unknown
        ) => SanitationResult;
        return fn(input, options);
    }

    private addSanitation(
        sanitation: SanitationFunctionName,
        options?: unknown
    ): Middleware {
        this.operations.push({
            type: "sanitation",
            sanitation,
            options,
        });
        if (this.operations.filter(({ type }) => type === "sanitation").length > 1) {
            throw new Error(
                "Multiple sanitation functions are not allowed due to being unsafe"
            );
        }
        return this.middleware;
    }
}
