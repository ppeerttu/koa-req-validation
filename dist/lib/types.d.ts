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
export declare type ValidatorOptions = IMinMaxOptions | RegExp | IsInValuesOptions | IOptionalOptions | string | IsAlphaLocale | IIsCurrencyOptions;
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
export {};
