[koa-request-validation](../README.md) > ["lib/ValidationResult"](../modules/_lib_validationresult_.md) > [ValidationResult](../classes/_lib_validationresult_.validationresult.md)

# Class: ValidationResult

Validation result set.

## Hierarchy

**ValidationResult**

## Index

### Constructors

* [constructor](_lib_validationresult_.validationresult.md#constructor)

### Properties

* [results](_lib_validationresult_.validationresult.md#results)

### Methods

* [array](_lib_validationresult_.validationresult.md#array)
* [hasErrors](_lib_validationresult_.validationresult.md#haserrors)
* [mapped](_lib_validationresult_.validationresult.md#mapped)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new ValidationResult**(results?: *[IValidationError](../interfaces/_index_.ivalidationerror.md)[]*): [ValidationResult](_lib_validationresult_.validationresult.md)

*Defined in [lib/ValidationResult.ts:9](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationResult.ts#L9)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` results | [IValidationError](../interfaces/_index_.ivalidationerror.md)[] |

**Returns:** [ValidationResult](_lib_validationresult_.validationresult.md)

___

## Properties

<a id="results"></a>

### `<Private>` results

**● results**: *[IValidationError](../interfaces/_index_.ivalidationerror.md)[]*

*Defined in [lib/ValidationResult.ts:9](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationResult.ts#L9)*

___

## Methods

<a id="array"></a>

###  array

▸ **array**(): [IValidationError](../interfaces/_index_.ivalidationerror.md)[]

*Defined in [lib/ValidationResult.ts:35](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationResult.ts#L35)*

Reuturn the validation results as an array.

**Returns:** [IValidationError](../interfaces/_index_.ivalidationerror.md)[]

___
<a id="haserrors"></a>

###  hasErrors

▸ **hasErrors**(): `boolean`

*Defined in [lib/ValidationResult.ts:28](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationResult.ts#L28)*

See if validation result has any validation errors.

**Returns:** `boolean`

___
<a id="mapped"></a>

###  mapped

▸ **mapped**(): [MappedValidationResults](../modules/_lib_types_.md#mappedvalidationresults)

*Defined in [lib/ValidationResult.ts:42](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/lib/ValidationResult.ts#L42)*

Return the validation results as mapped validation results.

**Returns:** [MappedValidationResults](../modules/_lib_types_.md#mappedvalidationresults)

___

