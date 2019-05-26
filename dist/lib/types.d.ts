import { ParameterizedContext } from "koa";
import { IValidationError } from "..";
/**
 * Options containing properties min and max.
 */
export interface IMinMaxOptions {
    min?: number;
    max?: number;
}
/**
 * Options containing an array of string.
 */
export declare type IsInValuesOptions = string[];
/**
 * Options containing allowNull flag.
 */
export interface IOptionalOptions {
    allowNull?: boolean;
}
/**
 * General validator options combining all
 * possible options.
 */
export declare type ValidatorOptions = IMinMaxOptions | RegExp | IsInValuesOptions | IOptionalOptions | string | number | IsAlphaLocale | IIsCurrencyOptions | IIsDecimalOptions | IIsFQDNOptions | IsIdentityCardLocale | IISSNOptions | 'any' | IsMobilePhoneLocale | IsMobilePhoneLocale[] | IsPostalCodeLocale | IIsURLOptions;
/**
 * Custom validation function with context object.
 */
declare type CustomValidatorFunctionWithContext = (input: any, ctx: ParameterizedContext) => Promise<void>;
/**
 * Definition of custom validation function. Custom
 * validation function should throw an error
 * when ever validation fails.
 */
export declare type CustomValidatorFunction = (input: any) => Promise<void>;
/**
 * Validation definition for internal module usage.
 */
export interface IValidationDefinition {
    validation: ValidatorFunctionName;
    message?: string;
    options?: ValidatorOptions | string;
    func?: CustomValidatorFunction | CustomValidatorFunctionWithContext;
}
/**
 * Allowed validation function name. This is the available list
 * of validators in the validator.js -module.
 */
export declare type ValidatorFunctionName = 'custom' | 'contains' | 'equals' | 'isAfter' | 'isAlpha' | 'isAlphanumeric' | 'isAscii' | 'isBase64' | 'isBefore' | 'isBoolean' | 'isByteLength' | 'isCreditCard' | 'isCurrency' | 'isDataURI' | 'isMagnetURI' | 'isDecimal' | 'isDivisibleBy' | 'isEmail' | 'isEmpty' | 'isFQDN' | 'isFloat' | 'isFullWidth' | 'isHalfWidth' | 'isHash' | 'isHexColor' | 'isHexadecimal' | 'isIdentityCard' | 'isIP' | 'isIPRange' | 'isISBN' | 'isISSN' | 'isISIN' | 'isISO8601' | 'isRFC3339' | 'isISO31661Alpha2' | 'isISRC' | 'isIn' | 'isInt' | 'isJSON' | 'isJWT' | 'isLatLong' | 'isLength' | 'isLowercase' | 'isMACAddress' | 'isMD5' | 'isMimeType' | 'isMobilePhone' | 'isMongoId' | 'isMultibyte' | 'isNumeric' | 'isPort' | 'isPostalCode' | 'isSurrogatePair' | 'isURL' | 'isUUID' | 'isUppercase' | 'isVariableWidth' | 'isWhitelisted' | 'matches';
/**
 * Location of the parameter to be validated.
 */
export declare enum ParamLocation {
    BODY = "body",
    PARAM = "param",
    QUERY = "query"
}
/**
 * Validation results as mapped object.
 */
export declare type MappedValidationResults = {
    [key: string]: IValidationError;
};
/**
 * Possibile locales.
 */
export declare type IsAlphaLocale = 'ar' | 'ar-AE' | 'ar-BH' | 'ar-DZ' | 'ar-EG' | 'ar-IQ' | 'ar-JO' | 'ar-KW' | 'ar-LB' | 'ar-LY' | 'ar-MA' | 'ar-QA' | 'ar-QM' | 'ar-SA' | 'ar-SD' | 'ar-SY' | 'ar-TN' | 'ar-YE' | 'bg-BG' | 'cs-CZ' | 'da-DK' | 'de-DE' | 'el-GR' | 'en-AU' | 'en-GB' | 'en-HK' | 'en-IN' | 'en-NZ' | 'en-US' | 'en-ZA' | 'en-ZM' | 'es-ES' | 'fr-FR' | 'hu-HU' | 'it-IT' | 'ku-IQ' | 'nb-NO' | 'nl-NL' | 'nn-NO' | 'pl-PL' | 'pt-BR' | 'pt-PT' | 'ru-RU' | 'sl-SI' | 'sk-SK' | 'sr-RS' | 'sr-RS@latin' | 'sv-SE' | 'tr-TR' | 'uk-UA';
/**
 * Locales for mobile phone validation.
 */
export declare type IsMobilePhoneLocale = 'ar-AE' | 'ar-DZ' | 'ar-EG' | 'ar-IQ' | 'ar-JO' | 'ar-KW' | 'ar-SA' | 'ar-SY' | 'ar-TN' | 'be-BY' | 'bg-BG' | 'bn-BD' | 'cs-CZ' | 'de-DE' | 'da-DK' | 'el-GR' | 'en-AU' | 'en-CA' | 'en-GB' | 'en-GH' | 'en-HK' | 'en-IE' | 'en-IN' | 'en-KE' | 'en-MU' | 'en-NG' | 'en-NZ' | 'en-RW' | 'en-SG' | 'en-UG' | 'en-US' | 'en-TZ' | 'en-ZA' | 'en-ZM' | 'en-PK' | 'es-ES' | 'es-MX' | 'es-UY' | 'et-EE' | 'fa-IR' | 'fi-FI' | 'fr-FR' | 'he-IL' | 'hu-HU' | 'it-IT' | 'ja-JP' | 'kk-KZ' | 'ko-KR' | 'lt-LT' | 'ms-MY' | 'nb-NO' | 'nn-NO' | 'pl-PL' | 'pt-PT' | 'pt-BR' | 'ro-RO' | 'ru-RU' | 'sl-SI' | 'sk-SK' | 'sr-RS' | 'sv-SE' | 'th-TH' | 'tr-TR' | 'uk-UA' | 'vi-VN' | 'zh-CN' | 'zh-HK' | 'zh-TW';
/**
 * Locales for postal code validation.
 */
export declare type IsPostalCodeLocale = 'any' | 'AD' | 'AT' | 'AU' | 'BE' | 'BG' | 'CA' | 'CH' | 'CZ' | 'DE' | 'DK' | 'DZ' | 'EE' | 'ES' | 'FI' | 'FR' | 'GB' | 'GR' | 'HR' | 'HU' | 'ID' | 'IL' | 'IN' | 'IS' | 'IT' | 'JP' | 'KE' | 'LI' | 'LT' | 'LU' | 'LV' | 'MX' | 'NL' | 'NO' | 'PL' | 'PT' | 'RO' | 'RU' | 'SA' | 'SE' | 'SI' | 'TN' | 'TW' | 'UA' | 'US' | 'ZA' | 'ZM';
/**
 * Options for isCurrency validation.
 */
export interface IIsCurrencyOptions {
    symbol?: string;
    require_symbol?: boolean;
    allow_space_after_symbol?: boolean;
    symbol_after_digits?: boolean;
    allow_negatives?: boolean;
    parens_for_negatives?: boolean;
    negative_sign_before_digits?: boolean;
    negative_sign_after_digits?: boolean;
    allow_negative_sign_placeholder?: boolean;
    thousands_separator?: string;
    decimal_separator?: string;
    allow_decimal?: boolean;
    require_decimal?: boolean;
    digits_after_decimal?: number[];
    allow_space_after_digits?: boolean;
}
/**
 * Options for isDecimal validation.
 */
export interface IIsDecimalOptions {
    force_decimal?: boolean;
    decimal_digits?: string;
    locale?: IsAlphaLocale;
}
/**
 * Options for isFQDN validation.
 */
export interface IIsFQDNOptions {
    require_tld?: boolean;
    allow_underscores?: boolean;
    allow_trailing_dot?: boolean;
}
/**
 * Options for isISSN validation.
 */
export interface IISSNOptions {
    case_sensitive?: boolean;
    require_hyphen?: boolean;
}
/**
 * URL protocols
 */
export declare type URLProtocol = 'http' | 'https' | 'ftp';
/**
 * Options for isURL validation.
 */
export interface IIsURLOptions {
    /**
     * Protocol of the url, defaults to all
     */
    protocols: URLProtocol[];
    /**
     * Defaults to `false`
     */
    require_tld: boolean;
    /**
     * Defaults to `false`
     */
    require_protocol: boolean;
    /**
     * Defaults to `true`
     */
    require_host: boolean;
    /**
     * Defaults to `true`
     */
    require_valid_protocol: boolean;
    /**
     * Defaults to `false`
     */
    allow_underscores: boolean;
    /**
     * Defaults to `false`
     */
    host_whitelist: boolean;
    /**
     * Defaults to `false`
     */
    host_blacklist: boolean;
    /**
     * Defaults to `false`
     */
    allow_trailing_dot: boolean;
    /**
     * Defaults to `false`
     */
    allow_protocol_relative_urls: boolean;
    /**
     * Defaults to `false`
     */
    disallow_auth: boolean;
}
export declare type IsIdentityCardLocale = 'any' | 'ES';
export {};
