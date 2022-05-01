import { RouterContext } from "@koa/router";

/**
 * Interface describing validation errors.
 */
export interface IValidationError {
    param: string;
    location: string;
    msg: string;
    value: string | null;
}

/**
 * Options containing allowNull flag.
 */
export interface IOptionalOptions {
    allowNull?: boolean;
}

/**
 * Custom validation function with context object.
 */
export type CustomValidatorFunctionWithContext = (
    input: unknown,
    ctx: RouterContext
) => Promise<void>;

/**
 * Definition of custom validation function. Custom
 * validation function should throw an error
 * when ever validation fails.
 */
export type CustomValidatorFunction = (input: unknown) => Promise<void>;

/**
 * Custom validation error message function. This function will receive the request
 * context and the user's input for the parameter, and it has to return the error
 * message as a result.f
 */
export type CustomErrorMessageFunction = (ctx: RouterContext, input: string) => string;

interface IValidationDefinitionBase {
    /**
     * Just a helper type for separating validation definitions from
     * sanitation definitions.
     */
    type: "validation";

    /**
     * Message for invalid value
     */
    message?: string | CustomErrorMessageFunction;

    /**
     * Options for validation function
     */
    options?: unknown;
}

type Subset<T, U extends T> = U;

export interface ICustomValidationDefinition extends IValidationDefinitionBase {
    validation: Subset<ValidatorFunctionName, "custom">;
    /**
     * Custom validation function
     */
    func: CustomValidatorFunction | CustomValidatorFunctionWithContext;
}

/**
 * Validation definition for internal module usage.
 */
export interface IValidationDefinition extends IValidationDefinitionBase {
    /**
     * Validation function
     */
    validation: Exclude<ValidatorFunctionName, "custom">;
}

/**
 * Allowed validation function name. This is the available list
 * of validators in the validator.js -module.
 */
export type ValidatorFunctionName =
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
 * Sanitation definition.
 */
export interface ISanitationDefinition {
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

/**
 * Allowed sanitation functions by validator.
 */
export type SanitationFunctionName =
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

/**
 * Location of the parameter to be validated.
 */
export enum ParamLocation {
    BODY = "body",
    PARAM = "param",
    QUERY = "query",
}

/**
 * Validation results as mapped object.
 */
export interface IMappedValidationResults {
    [key: string]: IValidationError;
}
