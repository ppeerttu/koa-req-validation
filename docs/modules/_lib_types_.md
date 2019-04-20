[koa-request-validation](../README.md) > ["lib/types"](../modules/_lib_types_.md)

# External module: "lib/types"

## Index

### Enumerations

* [ParamLocation](../enums/_lib_types_.paramlocation.md)

### Interfaces

* [IIsInValuesOptions](../interfaces/_lib_types_.iisinvaluesoptions.md)
* [IMinMaxOptions](../interfaces/_lib_types_.iminmaxoptions.md)
* [IOptionalOptions](../interfaces/_lib_types_.ioptionaloptions.md)
* [IValidationDefinition](../interfaces/_lib_types_.ivalidationdefinition.md)

### Type aliases

* [CustomValidatorFunction](_lib_types_.md#customvalidatorfunction)
* [MappedValidationResults](_lib_types_.md#mappedvalidationresults)
* [ValidatorFunctionName](_lib_types_.md#validatorfunctionname)
* [ValidatorOptions](_lib_types_.md#validatoroptions)

---

## Type aliases

<a id="customvalidatorfunction"></a>

###  CustomValidatorFunction

**Ƭ CustomValidatorFunction**: *`function`*

*Defined in [lib/types.ts:41](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/types.ts#L41)*

Definition of custom validation function. Custom validation function should throw an error when ever validation fails.

#### Type declaration
▸(input: *`any`*, ctx?: *`ParameterizedContext`*): `Promise`<`void`>

**Parameters:**

| Name | Type |
| ------ | ------ |
| input | `any` |
| `Optional` ctx | `ParameterizedContext` |

**Returns:** `Promise`<`void`>

___
<a id="mappedvalidationresults"></a>

###  MappedValidationResults

**Ƭ MappedValidationResults**: *`object`*

*Defined in [lib/types.ts:133](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/types.ts#L133)*

Validation results as mapped object.

#### Type declaration

[key: `string`]: [IValidationError](../interfaces/_index_.ivalidationerror.md)

___
<a id="validatorfunctionname"></a>

###  ValidatorFunctionName

**Ƭ ValidatorFunctionName**: *"custom" \| "contains" \| "equals" \| "isAfter" \| "isAlpha" \| "isAlphanumeric" \| "isAscii" \| "isBase64" \| "isBefore" \| "isBoolean" \| "isByteLength" \| "isCreditCard" \| "isCurrency" \| "isDataURI" \| "isMagnetURI" \| "isDecimal" \| "isDivisibleBy" \| "isEmail" \| "isEmpty" \| "isFQDN" \| "isFloat" \| "isFullWidth" \| "isHalfWidth" \| "isHash" \| "isHexColor" \| "isHexadecimal" \| "isIdentityCard" \| "isIP" \| "isIPRange" \| "isISBN" \| "isISSN" \| "isISIN" \| "isISO8601" \| "isRFC3339" \| "isISO31661Alpha2" \| "isISRC" \| "isIn" \| "isInt" \| "isJSON" \| "isJWT" \| "isLatLong" \| "isLength" \| "isLowercase" \| "isMACAddress" \| "isMD5" \| "isMimeType" \| "isMobilePhone" \| "isMongoId" \| "isMultibyte" \| "isNumeric" \| "isPort" \| "isPostalCode" \| "isSurrogatePair" \| "isURL" \| "isUUID" \| "isUppercase" \| "isVariableWidth" \| "isWhitelisted" \| "matches"*

*Defined in [lib/types.ts:60](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/types.ts#L60)*

Allowed validation function name. This is the available list of validators in the validator.js -module.

___
<a id="validatoroptions"></a>

###  ValidatorOptions

**Ƭ ValidatorOptions**: *[IMinMaxOptions](../interfaces/_lib_types_.iminmaxoptions.md) \| `RegExp` \| [IIsInValuesOptions](../interfaces/_lib_types_.iisinvaluesoptions.md) \| [IOptionalOptions](../interfaces/_lib_types_.ioptionaloptions.md)*

*Defined in [lib/types.ts:31](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/types.ts#L31)*

General validator options combining all possible options.

___

