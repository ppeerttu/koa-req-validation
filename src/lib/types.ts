import { ParameterizedContext } from 'koa';

/**
 * Interface describing validation errors.
 */
export interface IValidationError {
    param: string;
    location: string;
    msg: string;
    value: string;
}

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
export type IsInValuesOptions =  string[];

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
export type ValidatorOptions =  IMinMaxOptions
    | RegExp
    | IsInValuesOptions
    | IOptionalOptions
    | string
    | number
    | IsAlphaLocale
    | IIsCurrencyOptions
    | IIsDecimalOptions
    | IIsFQDNOptions
    | IsIdentityCardLocale
    | IISSNOptions
    | 'any'
    | IsMobilePhoneLocale
    | IsMobilePhoneLocale[]
    | IsPostalCodeLocale
    | IIsURLOptions;

/**
 * Sanitation options types
 */
export type SanitationOptions = boolean
    | string
    | number
    | INormalizeEmailOptions;

/**
 * Custom validation function with context object.
 */
type CustomValidatorFunctionWithContext = (
    input: any,
    ctx: ParameterizedContext,
) => Promise<void>;

/**
 * Definition of custom validation function. Custom
 * validation function should throw an error
 * when ever validation fails.
 */
export type CustomValidatorFunction = (
    input: any,
) => Promise<void>;

/**
 * Custom validation error message function. This function will receive the request
 * context and the user's input for the parameter, and it has to return the error
 * message as a result.f
 */
export type CustomErrorMessageFunction = (
    ctx: ParameterizedContext,
    input: string,
) => string;

/**
 * Validation definition for internal module usage.
 */
export interface IValidationDefinition {

    /**
     * Just a helper type for separating validation definitions from
     * sanitation definitions.
     */
    type: 'validation';

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
    options?: ValidatorOptions;

    /**
     * Custom validation function
     */
    func?: CustomValidatorFunction | CustomValidatorFunctionWithContext;
}

/**
 * Allowed validation function name. This is the available list
 * of validators in the validator.js -module.
 */
export type ValidatorFunctionName = 'custom'
    | 'contains'
    | 'equals'
    | 'isAfter'
    | 'isAlpha'
    | 'isAlphanumeric'
    | 'isAscii'
    | 'isBase64'
    | 'isBefore'
    | 'isBoolean'
    | 'isByteLength'
    | 'isCreditCard'
    | 'isCurrency'
    | 'isDataURI'
    | 'isMagnetURI' // Not found from validatorjs static type interface
    | 'isDecimal'
    | 'isDivisibleBy'
    | 'isEmail'
    | 'isEmpty'
    | 'isFQDN'
    | 'isFloat'
    | 'isFullWidth'
    | 'isHalfWidth'
    | 'isHash'
    | 'isHexColor'
    | 'isHexadecimal'
    | 'isIdentityCard' // Not found from validatorjs static type interface
    | 'isIP'
    | 'isIPRange'
    | 'isISBN'
    | 'isISSN'
    | 'isISIN'
    | 'isISO8601'
    | 'isRFC3339'
    | 'isISO31661Alpha2'
    // | 'isISO31661Alpha3'
    | 'isISRC'
    | 'isIn'
    | 'isInt'
    | 'isJSON'
    | 'isJWT'
    | 'isLatLong'
    | 'isLength'
    | 'isLowercase'
    | 'isMACAddress'
    | 'isMD5'
    | 'isMimeType'
    | 'isMobilePhone'
    | 'isMongoId'
    | 'isMultibyte'
    | 'isNumeric'
    | 'isPort'
    | 'isPostalCode'
    | 'isSurrogatePair'
    | 'isURL'
    | 'isUUID'
    | 'isUppercase'
    | 'isVariableWidth'
    | 'isWhitelisted'
    | 'matches';

/**
 * Sanitation definition.
 */
export interface ISanitationDefinition {

    /**
     * Just a type helper for separating sanitation definitions from
     * validation definitions
     */
    type: 'sanitation';

    /**
     * The sanitation function name
     */
    sanitation: SanitationFunctionName;

    /**
     * Options for the sanitation
     */
    options?: SanitationOptions;
}

/**
 * Allowed sanitation functions by validator.
 */
export type SanitationFunctionName = 'blacklist'
    | 'escape'
    | 'unescape'
    | 'ltrim'
    | 'normalizeEmail'
    | 'rtrim'
    | 'stripLow'
    | 'toBoolean'
    | 'toDate'
    | 'toFloat'
    | 'toInt'
    | 'trim'
    | 'whitelist';

/**
 * Location of the parameter to be validated.
 */
export enum ParamLocation {
    BODY = 'body',
    PARAM = 'param',
    QUERY = 'query',
}

/**
 * Validation results as mapped object.
 */
export interface IMappedValidationResults {
    [key: string]: IValidationError;
}

/**
 * Possibile locales.
 */
export type IsAlphaLocale = 'ar'
    | 'ar-AE'
    | 'ar-BH'
    | 'ar-DZ'
    | 'ar-EG'
    | 'ar-IQ'
    | 'ar-JO'
    | 'ar-KW'
    | 'ar-LB'
    | 'ar-LY'
    | 'ar-MA'
    | 'ar-QA'
    | 'ar-QM'
    | 'ar-SA'
    | 'ar-SD'
    | 'ar-SY'
    | 'ar-TN'
    | 'ar-YE'
    | 'bg-BG'
    | 'cs-CZ'
    | 'da-DK'
    | 'de-DE'
    | 'el-GR'
    | 'en-AU'
    | 'en-GB'
    | 'en-HK'
    | 'en-IN'
    | 'en-NZ'
    | 'en-US'
    | 'en-ZA'
    | 'en-ZM'
    | 'es-ES'
    | 'fr-FR'
    | 'hu-HU'
    | 'it-IT'
    | 'ku-IQ'
    | 'nb-NO'
    | 'nl-NL'
    | 'nn-NO'
    | 'pl-PL'
    | 'pt-BR'
    | 'pt-PT'
    | 'ru-RU'
    | 'sl-SI'
    | 'sk-SK'
    | 'sr-RS'
    | 'sr-RS@latin'
    | 'sv-SE'
    | 'tr-TR'
    | 'uk-UA';

/**
 * Locales for mobile phone validation.
 */
export type IsMobilePhoneLocale = 'ar-AE'
    | 'ar-DZ'
    | 'ar-EG'
    | 'ar-IQ'
    | 'ar-JO'
    | 'ar-KW'
    | 'ar-SA'
    | 'ar-SY'
    | 'ar-TN'
    | 'be-BY'
    | 'bg-BG'
    | 'bn-BD'
    | 'cs-CZ'
    | 'de-DE'
    | 'da-DK'
    | 'el-GR'
    | 'en-AU'
    | 'en-CA'
    | 'en-GB'
    | 'en-GH'
    | 'en-HK'
    | 'en-IE'
    | 'en-IN'
    | 'en-KE'
    | 'en-MU'
    | 'en-NG'
    | 'en-NZ'
    | 'en-RW'
    | 'en-SG'
    | 'en-UG'
    | 'en-US'
    | 'en-TZ'
    | 'en-ZA'
    | 'en-ZM'
    | 'en-PK'
    | 'es-ES'
    | 'es-MX'
    | 'es-UY'
    | 'et-EE'
    | 'fa-IR'
    | 'fi-FI'
    | 'fr-FR'
    | 'he-IL'
    | 'hu-HU'
    | 'it-IT'
    | 'ja-JP'
    | 'kk-KZ'
    | 'ko-KR'
    | 'lt-LT'
    | 'ms-MY'
    | 'nb-NO'
    | 'nn-NO'
    | 'pl-PL'
    | 'pt-PT'
    | 'pt-BR'
    | 'ro-RO'
    | 'ru-RU'
    | 'sl-SI'
    | 'sk-SK'
    | 'sr-RS'
    | 'sv-SE'
    | 'th-TH'
    | 'tr-TR'
    | 'uk-UA'
    | 'vi-VN'
    | 'zh-CN'
    | 'zh-HK'
    | 'zh-TW';

/**
 * Locales for postal code validation.
 */
export type IsPostalCodeLocale = 'any'
    | 'AD'
    | 'AT'
    | 'AU'
    | 'BE'
    | 'BG'
    | 'CA'
    | 'CH'
    | 'CZ'
    | 'DE'
    | 'DK'
    | 'DZ'
    | 'EE'
    | 'ES'
    | 'FI'
    | 'FR'
    | 'GB'
    | 'GR'
    | 'HR'
    | 'HU'
    | 'ID'
    | 'IL'
    | 'IN'
    | 'IS'
    | 'IT'
    | 'JP'
    | 'KE'
    | 'LI'
    | 'LT'
    | 'LU'
    | 'LV'
    | 'MX'
    | 'NL'
    | 'NO'
    | 'PL'
    | 'PT'
    | 'RO'
    | 'RU'
    | 'SA'
    | 'SE'
    | 'SI'
    | 'TN'
    | 'TW'
    | 'UA'
    | 'US'
    | 'ZA'
    | 'ZM';

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
export type URLProtocol = 'http' | 'https' | 'ftp';

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

export type IsIdentityCardLocale = 'any' | 'ES';

/**
 * Options for normalizing email address. Documentation straight from the validator.js
 * documentation at https://github.com/chriso/validator.js#sanitizers.
 */
export interface INormalizeEmailOptions {

    /**
     * Transforms the local part (before the @ symbol) of all email addresses to
     * lowercase. Please note that this may violate RFC 5321, which gives providers
     * the possibility to treat the local part of email addresses in a case sensitive
     * way (although in practice most - yet not all - providers don't). The domain part
     * of the email address is always lowercased, as it's case insensitive per RFC 1035.
     */
    all_lowercase?: boolean;

    /**
     * GMail addresses are known to be case-insensitive, so this switch allows lowercasing
     * them even when all_lowercase is set to false. Please note that when all_lowercase
     * is true, GMail addresses are lowercased regardless of the value of this setting.
     */
    gmail_lowercase?: boolean;

    /**
     * Removes dots from the local part of the email address, as GMail ignores
     * them (e.g. "john.doe" and "johndoe" are considered equal).
     */
    gmail_remove_dots?: boolean;

    /**
     * Normalizes addresses by removing "sub-addresses", which is the part following
     * a "+" sign (e.g. "foo+bar@gmail.com" becomes "foo@gmail.com").
     */
    gmail_remove_subaddress?: boolean;

    /**
     * Converts addresses with domain @googlemail.com to @gmail.com, as
     * they're equivalent.
     */
    gmail_convert_googlemaildotcom?: boolean;

    /**
     * Outlook.com addresses (including Windows Live and Hotmail) are known to be
     * case-insensitive, so this switch allows lowercasing them even when all_lowercase
     * is set to false. Please note that when all_lowercase is true, Outlook.com addresses
     * are lowercased regardless of the value of this setting.
     */
    outlookdotcom_lowercase?: boolean;

    /**
     * Normalizes addresses by removing "sub-addresses", which is the part following
     * a "+" sign (e.g. "foo+bar@outlook.com" becomes "foo@outlook.com").
     */
    outlookdotcom_remove_subaddress?: boolean;

    /**
     * Yahoo Mail addresses are known to be case-insensitive, so this switch allows
     * lowercasing them even when all_lowercase is set to false. Please note that when
     * all_lowercase is true, Yahoo Mail addresses are lowercased regardless of the value
     * of this setting.
     */
    yahoo_lowercase?: boolean;

    /**
     * Normalizes addresses by removing "sub-addresses", which is the part following a "-"
     * sign (e.g. "foo-bar@yahoo.com" becomes "foo@yahoo.com").
     */
    yahoo_remove_subaddress?: boolean;

    /**
     * iCloud addresses (including MobileMe) are known to be case-insensitive, so this
     * switch allows lowercasing them even when all_lowercase is set to false. Please
     * note that when all_lowercase is true, iCloud addresses are lowercased regardless
     * of the value of this setting.
     */
    icloud_lowercase?: boolean;

    /**
     * Normalizes addresses by removing "sub-addresses", which is the part following a "+"
     * sign (e.g. "foo+bar@icloud.com" becomes "foo@icloud.com").
     */
    icloud_remove_subaddress?: boolean;
}
