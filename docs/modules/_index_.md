[koa-request-validation](../README.md) > ["index"](../modules/_index_.md)

# External module: "index"

## Index

### Interfaces

* [IValidationContext](../interfaces/_index_.ivalidationcontext.md)
* [IValidationError](../interfaces/_index_.ivalidationerror.md)

### Functions

* [body](_index_.md#body)
* [param](_index_.md#param)
* [query](_index_.md#query)
* [validationResults](_index_.md#validationresults)

---

## Functions

<a id="body"></a>

### `<Const>` body

▸ **body**(param: *`string`*): [ValidationChain](../classes/_lib_validationchain_.validationchain.md)

*Defined in [index.ts:67](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/index.ts#L67)*

Validate request body.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| param | `string` |  The parameter to be validated from request.<br><br>```typescript router.post( '/auth/login', body('username').equals('user').run(), body('password').equals('pass').run(), handler ); ``` |

**Returns:** [ValidationChain](../classes/_lib_validationchain_.validationchain.md)

___
<a id="param"></a>

### `<Const>` param

▸ **param**(param: *`string`*): [ValidationChain](../classes/_lib_validationchain_.validationchain.md)

*Defined in [index.ts:103](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/index.ts#L103)*

Validate request param.

The parameter to be validated from request.

```typescript
router.get(
    '/api/users/:id',
    param('id').isInt().run(),
    handler
);
```

**Parameters:**

| Name | Type |
| ------ | ------ |
| param | `string` |

**Returns:** [ValidationChain](../classes/_lib_validationchain_.validationchain.md)

___
<a id="query"></a>

### `<Const>` query

▸ **query**(param: *`string`*): [ValidationChain](../classes/_lib_validationchain_.validationchain.md)

*Defined in [index.ts:85](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/index.ts#L85)*

Validate request query.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| param | `string` |  The parameter to be validated from request.<br><br>```typescript router.get( '/api/tags', query('search').contains('\_').run(), handler ); ``` |

**Returns:** [ValidationChain](../classes/_lib_validationchain_.validationchain.md)

___
<a id="validationresults"></a>

### `<Const>` validationResults

▸ **validationResults**(ctx: *`ParameterizedContext`<[IValidationContext](../interfaces/_index_.ivalidationcontext.md)>*): [ValidationResult](../classes/_lib_validationresult_.validationresult.md)

*Defined in [index.ts:37](https://github.com/ppeerttu/koa-request-validation/blob/a5664aa/src/index.ts#L37)*

Get validation results out of the context.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| ctx | `ParameterizedContext`<[IValidationContext](../interfaces/_index_.ivalidationcontext.md)> |  The request context |

**Returns:** [ValidationResult](../classes/_lib_validationresult_.validationresult.md)

___

