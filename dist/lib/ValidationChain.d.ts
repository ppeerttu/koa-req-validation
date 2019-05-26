/// <reference types="validator" />
import { ParamLocation, IMinMaxOptions, IOptionalOptions, CustomValidatorFunction, IsInValuesOptions, IsAlphaLocale, IIsCurrencyOptions, IIsDecimalOptions, IIsFQDNOptions, IISSNOptions, IsMobilePhoneLocale, IsPostalCodeLocale, IIsURLOptions } from './types';
import { ParameterizedContext } from 'koa';
import { IValidationContext } from '..';
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
     * Validations to be excecuted.
     */
    private validations;
    /**
     * Location of the given parameter.
     */
    private location;
    /**
     * Is this parameter optional?
     */
    private isOptional;
    /**
     * Create a new ValidationChain.
     *
     * @param parameter Name of the parameter to validate
     * @param location Location of the parameter in request
     */
    constructor(parameter: string, location: ParamLocation);
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
    run: () => (ctx: ParameterizedContext<IValidationContext, {}>, next: () => Promise<void>) => Promise<void>;
    /**
     * Pass a custom message to the validation.
     *
     * @param message Custom message
     */
    withMessage(message: string): this;
    /**
     * Set this property as optional.
     */
    optional(options?: IOptionalOptions): this;
    /**
     * Custom async validation function to execute. The function
     * must throw when the validation fails.
     *
     * @param func The validation function
     */
    custom(func: CustomValidatorFunction): this;
    /**
     * Check if the request property contains the given seed.
     */
    contains(seed: string): this;
    /**
     * Check if the request property equals the given comparison.
     */
    equals(comparison: string): this;
    /**
     * Check if the parameter is an integer.
     */
    isInt(options?: IMinMaxOptions): this;
    /**
     * Check if the string is in given length.
     *
     * @param options Min and max length
     */
    isLength(options: IMinMaxOptions): this;
    /**
     * Check if the parameter is an email.
     */
    isEmail(): this;
    /**
     * Check if the parameter is a boolean value.
     */
    isBoolean(): this;
    /**
     * Check if the parameter is a zero length string.
     */
    isEmpty(): this;
    /**
     * Check if the parameter is a float.
     */
    isFloat(): this;
    /**
     * Check if the parameter is an algorithm.
     *
     * @param algorithm The algorithm
     */
    isHash(algorithm: ValidatorJS.HashAlgorithm): this;
    /**
     * Check if the parameter is a valid JWT token.
     */
    isJWT(): this;
    /**
     * Check if the parameter is a valid JSON. Uses
     * `JSON.parse`.
     */
    isJSON(): this;
    /**
     * Check if the parameter is a latitude-lognitude coordinate
     * in the format `lat,long` or `lat, long`.
     */
    isLatLong(): this;
    /**
     * Check if the paramter contains only lowercase characters.
     */
    isLowercase(): this;
    /**
     * Check if the parameter is a MAC address.
     */
    isMACAddress(): this;
    /**
     * Check if the parameter is a valid MongoDB ObjectId.
     */
    isMongoId(): this;
    /**
     * Check if the parameter contains only numbers.
     */
    isNumeric(): this;
    /**
     * Check if the parameter is a valid port number.
     */
    isPort(): this;
    /**
     * Check if the parameter is valid UUID (v3, v4 or v5).
     */
    isUUID(): this;
    /**
     * Check if the parameter contains only uppercase characters.
     */
    isUppercase(): this;
    /**
     * Check if the parameter matches given regular expression.
     *
     * @param regExp The regular expression
     */
    matches(regExp: RegExp): this;
    /**
     * Check if the parameter is some of the allowed
     * values.
     *
     * @param values Options containing at least `values`
     * property with allowed values
     */
    isIn(values: IsInValuesOptions): this;
    /**
     * Check if the string is a date that's after the specified
     * date (defaults to now).
     *
     * @param date The date
     */
    isAfter(date?: string): this;
    /**
     * Check if the string contains only letters. Locale
     * defaults to en-US.
     *
     * @param locale The locale
     */
    isAlpha(locale?: IsAlphaLocale): this;
    /**
     * Check if the string contains only letters and numbers.
     * Locale defaults to en-US.
     *
     * @param locale The locale
     */
    isAlphanumeric(locale?: IsAlphaLocale): this;
    /**
     * Check if the string contains ACII characters only.
     */
    isAscii(): this;
    /**
     * Check if the string is base64 encoded.
     */
    isBase64(): this;
    /**
     * Check if the string is a date that's before
     * the given date. Defaults to now.
     *
     * @param date The date
     */
    isBefore(date?: string): this;
    /**
     * Check if the strin's length (in UTF-8 bytes)
     * falls in range.
     *
     * @param options The range
     */
    isByteLength(options?: IMinMaxOptions): this;
    /**
     * Check if the string is a credit card.
     */
    isCreditCard(): this;
    /**
     * Check if the string is a valid currency amount.
     *
     * @param options The options
     */
    isCurrency(options?: IIsCurrencyOptions): this;
    /**
     * Check if the string is a data uri format.
     */
    isDataURI(): this;
    /**
     * Check if the string represents a decimal number.
     *
     * @param options The options
     */
    isDecimal(options?: IIsDecimalOptions): this;
    /**
     * Check if the string is a number divisible by
     * given number.
     *
     * @param division The division number
     */
    isDivisibleBy(division: number): this;
    /**
     * Check if the string is fully qualified
     * domain name.
     *
     * @param options The options
     */
    isFQDN(options?: IIsFQDNOptions): this;
    /**
     * Check if the string contains any full-width
     * chars.
     */
    isFullWidth(): this;
    /**
     * Check if the string contains any half-width
     * chars.
     */
    isHalfWidth(): this;
    /**
     * Check if the string is a hexadecimal
     * color.
     */
    isHexColor(): this;
    /**
     * Check if the string is a hexadecimal
     * number.
     */
    isHexadecimal(): this;
    /**
     * Check if the string is an IP (ver 4 or 6).
     */
    isIP(version?: 4 | 6): this;
    /**
     * Check if the string is an IP range (ver 4 only).
     */
    isIPRange(): this;
    /**
     * Check if the string is an ISBN.
     *
     * @param version The version
     */
    isISBN(version: 10 | 13): this;
    /**
     * Check if the string is an ISSN.
     *
     * @param options The options
     */
    isISSN(options?: IISSNOptions): this;
    /**
     * Check if the string is an ISIN.
     */
    isISIN(): this;
    /**
     * Check if the string is valid ISO8601 date.
     */
    isISO8601(): this;
    /**
     * Check if the string is valid RFC3339 date.
     */
    isRFC3339(): this;
    /**
     * Check if the string is a valid ISO 3166-1 alpha-2
     * officially assigned country code.
     */
    isISO31661Alpha2(): this;
    /**
     * Check if the string is a ISRC.
     */
    isISRC(): this;
    /**
     * Check if the string is a MD5 hash.
     */
    isMD5(): this;
    /**
     * Check if the string is a valid MIME type format.
     */
    isMimeType(): this;
    /**
     * Check if the string is a mobile phone number.
     *
     * @param locale The locale, defaults to any
     */
    isMobilePhone(locale?: 'any' | IsMobilePhoneLocale | IsMobilePhoneLocale[]): this;
    /**
     * Check if the string contains one or more multibyte chars.
     */
    isMultibyte(): this;
    /**
     * Check if the string is a postal code.
     *
     * @param locale The locale to use
     */
    isPostalCode(locale?: IsPostalCodeLocale): this;
    /**
     * Check if the string contains any surrogate pairs chars.
     */
    isSurrogatePair(): this;
    /**
     * Check if the string is an URL.
     *
     * @param options Possible options
     */
    isURL(options?: IIsURLOptions): this;
    /**
     * Check if the string contains a mixture of full and half-width chars.
     */
    isVariableWidth(): this;
    /**
     * Checks characters if they appear in the whitelist.
     *
     * @param chars The characters
     */
    isWhitelisted(chars: string | string[]): this;
    /**
     * Run the validations and return the results.
     * @param ctx The context
     */
    private checkResults;
}
