[koa-request-validation](../README.md) > ["lib/ValidationChain"](../modules/_lib_validationchain_.md) > [ValidationChain](../classes/_lib_validationchain_.validationchain.md)

# Class: ValidationChain

The validation chain object.

## Hierarchy

**ValidationChain**

## Index

### Constructors

* [constructor](_lib_validationchain_.validationchain.md#constructor)

### Properties

* [isOptional](_lib_validationchain_.validationchain.md#isoptional)
* [location](_lib_validationchain_.validationchain.md#location)
* [parameter](_lib_validationchain_.validationchain.md#parameter)
* [validations](_lib_validationchain_.validationchain.md#validations)

### Methods

* [checkResults](_lib_validationchain_.validationchain.md#checkresults)
* [contains](_lib_validationchain_.validationchain.md#contains)
* [custom](_lib_validationchain_.validationchain.md#custom)
* [equals](_lib_validationchain_.validationchain.md#equals)
* [isBoolean](_lib_validationchain_.validationchain.md#isboolean)
* [isEmail](_lib_validationchain_.validationchain.md#isemail)
* [isEmpty](_lib_validationchain_.validationchain.md#isempty)
* [isFloat](_lib_validationchain_.validationchain.md#isfloat)
* [isHash](_lib_validationchain_.validationchain.md#ishash)
* [isInt](_lib_validationchain_.validationchain.md#isint)
* [isJSON](_lib_validationchain_.validationchain.md#isjson)
* [isJWT](_lib_validationchain_.validationchain.md#isjwt)
* [isLatLong](_lib_validationchain_.validationchain.md#islatlong)
* [isLength](_lib_validationchain_.validationchain.md#islength)
* [isLowercase](_lib_validationchain_.validationchain.md#islowercase)
* [isMACAddress](_lib_validationchain_.validationchain.md#ismacaddress)
* [isMongoId](_lib_validationchain_.validationchain.md#ismongoid)
* [isNumeric](_lib_validationchain_.validationchain.md#isnumeric)
* [isPort](_lib_validationchain_.validationchain.md#isport)
* [isUUID](_lib_validationchain_.validationchain.md#isuuid)
* [isUppercase](_lib_validationchain_.validationchain.md#isuppercase)
* [matches](_lib_validationchain_.validationchain.md#matches)
* [optional](_lib_validationchain_.validationchain.md#optional)
* [run](_lib_validationchain_.validationchain.md#run)
* [withMessage](_lib_validationchain_.validationchain.md#withmessage)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new ValidationChain**(parameter: *`string`*, location: *[ParamLocation](../enums/_lib_types_.paramlocation.md)*): [ValidationChain](_lib_validationchain_.validationchain.md)

*Defined in [lib/ValidationChain.ts:39](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L39)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| parameter | `string` |
| location | [ParamLocation](../enums/_lib_types_.paramlocation.md) |

**Returns:** [ValidationChain](_lib_validationchain_.validationchain.md)

___

## Properties

<a id="isoptional"></a>

### `<Private>` isOptional

**● isOptional**: *`object`*

*Defined in [lib/ValidationChain.ts:36](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L36)*

Is this parameter optional

#### Type declaration

`Optional`  options: [IOptionalOptions](../interfaces/_lib_types_.ioptionaloptions.md)

 value: `boolean`

___
<a id="location"></a>

### `<Private>` location

**● location**: *[ParamLocation](../enums/_lib_types_.paramlocation.md)*

*Defined in [lib/ValidationChain.ts:31](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L31)*

Location of the given parameter.

___
<a id="parameter"></a>

### `<Private>` parameter

**● parameter**: *`string`*

*Defined in [lib/ValidationChain.ts:21](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L21)*

Parameter to be validated.

___
<a id="validations"></a>

### `<Private>` validations

**● validations**: *[IValidationDefinition](../interfaces/_lib_types_.ivalidationdefinition.md)[]*

*Defined in [lib/ValidationChain.ts:26](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L26)*

Validations to be excecuted.

___

## Methods

<a id="checkresults"></a>

### `<Private>` checkResults

▸ **checkResults**(ctx: *`ParameterizedContext`<[IValidationContext](../interfaces/_index_.ivalidationcontext.md)>*): `Promise`<[ValidationResult](_lib_validationresult_.validationresult.md) \| `null`>

*Defined in [lib/ValidationChain.ts:325](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L325)*

Run the validations and return the results.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| ctx | `ParameterizedContext`<[IValidationContext](../interfaces/_index_.ivalidationcontext.md)> |  The context |

**Returns:** `Promise`<[ValidationResult](_lib_validationresult_.validationresult.md) \| `null`>

___
<a id="contains"></a>

###  contains

▸ **contains**(seed: *`string`*): `this`

*Defined in [lib/ValidationChain.ts:111](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L111)*

Check if the request property contains the given seed.

**Parameters:**

| Name | Type |
| ------ | ------ |
| seed | `string` |

**Returns:** `this`

___
<a id="custom"></a>

###  custom

▸ **custom**(func: *[CustomValidatorFunction](../modules/_lib_types_.md#customvalidatorfunction)*): `this`

*Defined in [lib/ValidationChain.ts:100](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L100)*

Custom async validation function to execute. The function must throw when the validation fails.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| func | [CustomValidatorFunction](../modules/_lib_types_.md#customvalidatorfunction) |  The validation function |

**Returns:** `this`

___
<a id="equals"></a>

###  equals

▸ **equals**(comparison: *`string`*): `this`

*Defined in [lib/ValidationChain.ts:122](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L122)*

Check if the request property equals the given comparison.

**Parameters:**

| Name | Type |
| ------ | ------ |
| comparison | `string` |

**Returns:** `this`

___
<a id="isboolean"></a>

###  isBoolean

▸ **isBoolean**(): `this`

*Defined in [lib/ValidationChain.ts:167](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L167)*

Check if the parameter is a boolean value.

**Returns:** `this`

___
<a id="isemail"></a>

###  isEmail

▸ **isEmail**(): `this`

*Defined in [lib/ValidationChain.ts:157](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L157)*

Check if the parameter is an email.

**Returns:** `this`

___
<a id="isempty"></a>

###  isEmpty

▸ **isEmpty**(): `this`

*Defined in [lib/ValidationChain.ts:177](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L177)*

Check if the parameter is a zero length string.

**Returns:** `this`

___
<a id="isfloat"></a>

###  isFloat

▸ **isFloat**(): `this`

*Defined in [lib/ValidationChain.ts:187](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L187)*

Check if the parameter is a float.

**Returns:** `this`

___
<a id="ishash"></a>

###  isHash

▸ **isHash**(algorithm: *`ValidatorJS.HashAlgorithm`*): `this`

*Defined in [lib/ValidationChain.ts:199](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L199)*

Check if the parameter is an algorithm.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| algorithm | `ValidatorJS.HashAlgorithm` |  The algorithm |

**Returns:** `this`

___
<a id="isint"></a>

###  isInt

▸ **isInt**(options?: *[IMinMaxOptions](../interfaces/_lib_types_.iminmaxoptions.md)*): `this`

*Defined in [lib/ValidationChain.ts:133](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L133)*

Check if the parameter is an integer.

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` options | [IMinMaxOptions](../interfaces/_lib_types_.iminmaxoptions.md) |

**Returns:** `this`

___
<a id="isjson"></a>

###  isJSON

▸ **isJSON**(): `this`

*Defined in [lib/ValidationChain.ts:221](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L221)*

Check if the parameter is a valid JSON. Uses `JSON.parse`.

**Returns:** `this`

___
<a id="isjwt"></a>

###  isJWT

▸ **isJWT**(): `this`

*Defined in [lib/ValidationChain.ts:210](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L210)*

Check if the parameter is a valid JWT token.

**Returns:** `this`

___
<a id="islatlong"></a>

###  isLatLong

▸ **isLatLong**(): `this`

*Defined in [lib/ValidationChain.ts:232](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L232)*

Check if the parameter is a latitude-lognitude coordinate in the format `lat,long` or `lat, long`.

**Returns:** `this`

___
<a id="islength"></a>

###  isLength

▸ **isLength**(options: *[IMinMaxOptions](../interfaces/_lib_types_.iminmaxoptions.md)*): `this`

*Defined in [lib/ValidationChain.ts:146](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L146)*

Check if the string is in given length.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| options | [IMinMaxOptions](../interfaces/_lib_types_.iminmaxoptions.md) |  Min and max length |

**Returns:** `this`

___
<a id="islowercase"></a>

###  isLowercase

▸ **isLowercase**(): `this`

*Defined in [lib/ValidationChain.ts:242](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L242)*

Check if the paramter contains only lowercase characters.

**Returns:** `this`

___
<a id="ismacaddress"></a>

###  isMACAddress

▸ **isMACAddress**(): `this`

*Defined in [lib/ValidationChain.ts:252](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L252)*

Check if the parameter is a MAC address.

**Returns:** `this`

___
<a id="ismongoid"></a>

###  isMongoId

▸ **isMongoId**(): `this`

*Defined in [lib/ValidationChain.ts:262](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L262)*

Check if the parameter is a valid MongoDB ObjectId.

**Returns:** `this`

___
<a id="isnumeric"></a>

###  isNumeric

▸ **isNumeric**(): `this`

*Defined in [lib/ValidationChain.ts:272](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L272)*

Check if the parameter contains only numbers.

**Returns:** `this`

___
<a id="isport"></a>

###  isPort

▸ **isPort**(): `this`

*Defined in [lib/ValidationChain.ts:282](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L282)*

Check if the parameter is a valid port number.

**Returns:** `this`

___
<a id="isuuid"></a>

###  isUUID

▸ **isUUID**(): `this`

*Defined in [lib/ValidationChain.ts:292](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L292)*

Check if the parameter is valid UUID (v3, v4 or v5).

**Returns:** `this`

___
<a id="isuppercase"></a>

###  isUppercase

▸ **isUppercase**(): `this`

*Defined in [lib/ValidationChain.ts:302](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L302)*

Check if the parameter contains only uppercase characters.

**Returns:** `this`

___
<a id="matches"></a>

###  matches

▸ **matches**(regExp: *`RegExp`*): `this`

*Defined in [lib/ValidationChain.ts:313](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L313)*

Check if the parameter matches given regular expression.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| regExp | `RegExp` |  The regular expression |

**Returns:** `this`

___
<a id="optional"></a>

###  optional

▸ **optional**(options?: *[IOptionalOptions](../interfaces/_lib_types_.ioptionaloptions.md)*): `this`

*Defined in [lib/ValidationChain.ts:86](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L86)*

Set this property as optional.

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` options | [IOptionalOptions](../interfaces/_lib_types_.ioptionaloptions.md) |

**Returns:** `this`

___
<a id="run"></a>

###  run

▸ **run**(): `(Anonymous function)`

*Defined in [lib/ValidationChain.ts:58](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L58)*

**Returns:** `(Anonymous function)`

___
<a id="withmessage"></a>

###  withMessage

▸ **withMessage**(message: *`string`*): `this`

*Defined in [lib/ValidationChain.ts:77](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationChain.ts#L77)*

Pass a custom message to the validation.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| message | `string` |  Custom message |

**Returns:** `this`

___

