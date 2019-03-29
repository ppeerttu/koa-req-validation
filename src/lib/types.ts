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
export interface IIsInValuesOptions {
    values?: string[];
}

/**
 * Options containing allowNull flag.
 */
export interface IAllowNullOptions {
    allowNull?: boolean;
}

/**
 * General validator options combining all
 * possible options.
 */
export type ValidatorOptions =  IMinMaxOptions
    | RegExp
    | IIsInValuesOptions
    | IAllowNullOptions;

/**
 * Definition of custom validation function. Custom
 * validation function should throw an error
 * when ever validation fails.
 */
export type CustomValidatorFunction = (
    input: any,
    ctx?: ParameterizedContext,
) => Promise<void>;

/**
 * Validation definition for internal module usage.
 */
export interface IValidationDefinition {
    validation: ValidatorFunctionName;
    message?: string;
    options?: ValidatorOptions | string;
    func?: CustomValidatorFunction;
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
    | 'isMagnetURI'
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
    | 'isIdentityCard'
    | 'isIP'
    | 'isIPRange'
    | 'isISBN'
    | 'isISSN'
    | 'isISIN'
    | 'isISO8601'
    | 'isRFC3339'
    | 'isISO31661Alpha2'
    //| 'isISO31661Alpha3'
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
 * Location of the parameter to be validated.
 */
export enum ParamLocation {
    BODY = 'body',
    PARAM = 'param',
    QUERY = 'query'
}

/**
 * Validation results as mapped object.
 */
export type MappedValidationResults = { [key: string]: IValidationError };
