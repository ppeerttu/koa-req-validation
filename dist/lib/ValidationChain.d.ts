import { Middleware } from "@koa/router";
import validator from "validator";
import { CustomErrorMessageFunction, CustomValidatorFunction, IOptionalOptions, ParamLocation } from "./types";
/**
 * The validation chain object.
 */
export default class ValidationChain {
    /**
     * Default error message when validation fails.
     */
    readonly defaultErrorMessage = "Invalid value";
    /**
     * Parameter to be validated.
     */
    private parameter;
    /**
     * Validations and sanitations to be executed.
     */
    private operations;
    /**
     * Location of the given parameter.
     */
    private location;
    /**
     * Is this parameter optional?
     */
    private isOptional;
    private hasNonStringSanitizer;
    /**
     * Create a new ValidationChain.
     *
     * @param parameter Name of the parameter to validate
     * @param location Location of the parameter in request
     */
    constructor(parameter: string, location: ParamLocation);
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
    build: () => Middleware;
    /**
     * @deprecated Use `build()` instead
     */
    run: () => Middleware;
    /**
     * Pass a custom message to the validation.
     *
     * @param message Custom message
     *
     * @throws {Error} No validation has been set before `withMessage()` has been called
     */
    withMessage(message: string | CustomErrorMessageFunction): ValidationChain;
    /**
     * Set this property as optional.
     */
    optional(options?: IOptionalOptions): ValidationChain;
    /**
     * Custom async validation function to execute. The function
     * must throw when the validation fails.
     *
     * @param func The validation function
     */
    custom(func: CustomValidatorFunction): ValidationChain;
    /**
     * Check if the request property contains the given seed.
     */
    contains(seed: string): ValidationChain;
    /**
     * Check if the request property equals the given comparison.
     */
    equals(comparison: string): ValidationChain;
    /**
     * Check if the parameter is an integer.
     */
    isInt(options?: validator.IsIntOptions): ValidationChain;
    /**
     * Check if the string is in given length.
     *
     * @param options Min and max length
     */
    isLength(options: validator.IsLengthOptions): ValidationChain;
    /**
     * Check if the parameter is an email.
     */
    isEmail(options?: validator.IsEmailOptions): ValidationChain;
    /**
     * Check if the parameter is a boolean value.
     */
    isBoolean(): ValidationChain;
    /**
     * Check if the parameter is a zero length string.
     */
    isEmpty(options?: validator.IsEmptyOptions): ValidationChain;
    /**
     * Check if the parameter is a float.
     */
    isFloat(options?: validator.IsFloatOptions): ValidationChain;
    /**
     * Check if the parameter is an algorithm.
     *
     * @param algorithm The algorithm
     */
    isHash(algorithm: validator.HashAlgorithm): ValidationChain;
    /**
     * Check if the parameter is a valid JWT token.
     */
    isJWT(): ValidationChain;
    /**
     * Check if the parameter is a valid JSON. Uses
     * `JSON.parse`.
     */
    isJSON(): ValidationChain;
    /**
     * Check if the parameter is a latitude-lognitude coordinate
     * in the format `lat,long` or `lat, long`.
     */
    isLatLong(): ValidationChain;
    /**
     * Check if the paramter contains only lowercase characters.
     */
    isLowercase(): ValidationChain;
    /**
     * Check if the parameter is a MAC address.
     */
    isMACAddress(options?: validator.IsMACAddressOptions): ValidationChain;
    /**
     * Check if the parameter is a valid MongoDB ObjectId.
     */
    isMongoId(): ValidationChain;
    /**
     * Check if the parameter contains only numbers.
     */
    isNumeric(options?: validator.IsNumericOptions): ValidationChain;
    /**
     * Check if the parameter is a valid port number.
     */
    isPort(): ValidationChain;
    /**
     * Check if the parameter is valid UUID (v3, v4 or v5).
     */
    isUUID(version?: 3 | 4 | 5 | "3" | "4" | "5" | "all"): ValidationChain;
    /**
     * Check if the parameter contains only uppercase characters.
     */
    isUppercase(): ValidationChain;
    /**
     * Check if the parameter matches given regular expression.
     *
     * @param regExp The regular expression
     */
    matches(regExp: RegExp): ValidationChain;
    /**
     * Check if the parameter is some of the allowed
     * values.
     *
     * @param values Options containing at least `values`
     * property with allowed values
     */
    isIn(values: string[]): ValidationChain;
    /**
     * Check if the string is a date that's after the specified
     * date (defaults to now).
     *
     * @param date The date (defaults to now)
     */
    isAfter(date?: string): ValidationChain;
    /**
     * Check if the string contains only letters. Locale
     * defaults to en-US.
     *
     * @param locale The locale
     */
    isAlpha(locale?: validator.AlphaLocale): ValidationChain;
    /**
     * Check if the string contains only letters and numbers.
     * Locale defaults to en-US.
     *
     * @param locale The locale
     */
    isAlphanumeric(locale?: validator.AlphanumericLocale): ValidationChain;
    /**
     * Check if the string contains ASCII characters only.
     */
    isAscii(): ValidationChain;
    /**
     * Check if the string is base64 encoded.
     */
    isBase64(): ValidationChain;
    /**
     * Check if the string is a date that's before
     * the given date, which defaults to now.
     *
     * @param date The date (defaults to now)
     */
    isBefore(date?: string): ValidationChain;
    /**
     * Check if the strin's length (in UTF-8 bytes)
     * falls in range.
     *
     * @param options The range
     */
    isByteLength(options?: validator.IsByteLengthOptions): ValidationChain;
    /**
     * Check if the string is a credit card.
     */
    isCreditCard(): ValidationChain;
    /**
     * Check if the string is a valid currency amount.
     *
     * @param options The options
     */
    isCurrency(options?: validator.IsCurrencyOptions): ValidationChain;
    /**
     * Check if the string is a data uri format.
     */
    isDataURI(): ValidationChain;
    /**
     * Check if the string represents a decimal number.
     *
     * @param options The options
     */
    isDecimal(options?: validator.IsDecimalOptions): ValidationChain;
    /**
     * Check if the string is a number divisible by
     * given number.
     *
     * @param division The division number
     */
    isDivisibleBy(division: number): ValidationChain;
    /**
     * Check if the string is fully qualified
     * domain name.
     *
     * @param options The options
     */
    isFQDN(options?: validator.IsFQDNOptions): ValidationChain;
    /**
     * Check if the string contains any full-width
     * chars.
     */
    isFullWidth(): ValidationChain;
    /**
     * Check if the string contains any half-width
     * chars.
     */
    isHalfWidth(): ValidationChain;
    /**
     * Check if the string is a hexadecimal
     * color.
     */
    isHexColor(): ValidationChain;
    /**
     * Check if the string is a hexadecimal
     * number.
     */
    isHexadecimal(): ValidationChain;
    /**
     * Check if the string is an IP (ver 4 or 6).
     */
    isIP(version?: 4 | 6 | "4" | "6"): ValidationChain;
    /**
     * Check if the string is an IP range (ver 4 only).
     */
    isIPRange(): ValidationChain;
    /**
     * Check if the string is an ISBN.
     *
     * @param version The version
     */
    isISBN(version: 10 | 13 | "10" | "13"): ValidationChain;
    /**
     * Check if the string is an ISSN.
     *
     * @param options The options
     */
    isISSN(options?: validator.IsISSNOptions): ValidationChain;
    /**
     * Check if the string is an ISIN.
     */
    isISIN(): ValidationChain;
    /**
     * Check if the string is valid ISO8601 date.
     */
    isISO8601(options?: validator.IsISO8601Options): ValidationChain;
    /**
     * Check if the string is valid RFC3339 date.
     */
    isRFC3339(): ValidationChain;
    /**
     * Check if the string is a valid ISO 3166-1 alpha-2
     * officially assigned country code.
     */
    isISO31661Alpha2(): ValidationChain;
    /**
     * Check if the string is a valid ISO 3166-1 alpha-3
     * officially assigned country code.
     */
    isISO31661Alpha3(): ValidationChain;
    /**
     * Check if the string is a ISRC.
     */
    isISRC(): ValidationChain;
    /**
     * Check if the string is a MD5 hash.
     */
    isMD5(): ValidationChain;
    /**
     * Check if the string is a valid MIME type format.
     */
    isMimeType(): ValidationChain;
    /**
     * Check if the string is a mobile phone number.
     *
     * @param locale The locale, defaults to any
     */
    isMobilePhone(locale?: validator.MobilePhoneLocale | validator.MobilePhoneLocale[] | "any"): ValidationChain;
    /**
     * Check if the string contains one or more multibyte chars.
     */
    isMultibyte(): ValidationChain;
    /**
     * Check if the string is a postal code.
     *
     * @param locale The locale to use
     */
    isPostalCode(locale?: validator.PostalCodeLocale | "any"): ValidationChain;
    /**
     * Check if the string contains any surrogate pairs chars.
     */
    isSurrogatePair(): ValidationChain;
    /**
     * Check if the string is an URL.
     *
     * @param options Possible options
     */
    isURL(options?: validator.IsURLOptions): ValidationChain;
    /**
     * Check if the string contains a mixture of full and half-width chars.
     */
    isVariableWidth(): ValidationChain;
    /**
     * Checks characters if they appear in the whitelist.
     *
     * @param chars The characters
     */
    isWhitelisted(chars: string | string[]): ValidationChain;
    /**
     * Remove characters that appear in the blacklist. The characters are used in a RegExp
     * and so you will need to escape some chars, e.g. blacklist(input, '\\[\\]').
     *
     * @param chars Characters to blacklist
     */
    blacklist(chars: string): ValidationChain;
    /**
     * Replace <, >, &, ', ' and / with HTML entities.
     */
    escape(): ValidationChain;
    /**
     * Replaces HTML encoded entities with <, >, &, ", ' and /.
     */
    unescape(): ValidationChain;
    /**
     * Trim characters from the left-side of the input.
     *
     * @param chars The characters to trim
     */
    ltrim(chars?: string): ValidationChain;
    /**
     * Trim characters from the right-side of the input.
     *
     * @param chars The characters to trim
     */
    rtrim(chars?: string): ValidationChain;
    /**
     * Normalize email address.
     *
     * @param options The options
     *
     * @see https://github.com/chriso/validator.js For details
     */
    normalizeEmail(options?: validator.NormalizeEmailOptions): ValidationChain;
    /**
     * Remove characters with a numerical value < 32 and 127, mostly control characters.
     * If keep_new_lines is true, newline characters are preserved (\n and \r, hex 0xA
     * and 0xD). Unicode-safe in JavaScript.
     *
     * @param keepNewLines
     */
    stripLow(keepNewLines?: boolean): ValidationChain;
    /**
     * convert the input string to a boolean. Everything except for '0', 'false' and ''
     * returns true. In strict mode only '1' and 'true' return true.
     */
    toBoolean(strict?: boolean): ValidationChain;
    /**
     * Convert the input string to a date.
     */
    toDate(): ValidationChain;
    /**
     * Convert the input string to a float.
     */
    toFloat(): ValidationChain;
    /**
     * Convert the input string to an integer, or NaN if the input is not an integer.
     */
    toInt(radix?: number): ValidationChain;
    /**
     * Trim characters (whitespace by default) from both sides of the input.
     *
     * @param chars The characters to trim
     */
    trim(chars?: string): ValidationChain;
    /**
     * Remove characters that do not appear in the whitelist. The characters are used in a
     * RegExp and so you will need to escape some chars, e.g. whitelist(input, '\\[\\]').
     *
     * @param chars Characters to whitelist
     */
    whitelist(chars: string): ValidationChain;
    /**
     * Run the validations and return the results.
     * @param ctx The context
     */
    private checkResults;
    /**
     * Get original input as it is from the request body.
     *
     * @param ctx The context
     */
    private getOriginalInput;
    /**
     * Get parameter from object.
     *
     * @param object Object to look the property from
     */
    private getParamFromObject;
    /**
     * Sanitize the given input value with given sanitation definition.
     *
     * @param input The input as string
     */
    private sanitize;
    private addValidation;
    private addSanitation;
}
