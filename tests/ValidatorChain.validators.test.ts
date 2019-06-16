import { validationResults } from '../src';
import { CustomErrorMessageFunction, ParamLocation } from '../src/lib/types';
import ValidationChain from '../src/lib/ValidationChain';
import { mockContext } from './helpers';

/**
 * Mock next function
 */
const next = async () => {
    // no-op
};

const prop = 'property';

/**
 * Using Node.JS
 * ```javascript
 * const crypto = require('crypto');
 * const message = 'Crazy fox jumps over lazy dog';
 * const md5Hash = crypto.createHash('md5').update(message).digest('hex');
 * ```
 */
const md5Hash = 'df269a00dd2d9e26b65a1cb6b55aeec0';

/**
 * ValidationChain validation functions
 */
describe('ValidatorChain validators', () => {

    describe('optional()', () => {

        test('Ignores undefined value', async () => {
            const validationChain = new ValidationChain('param', ParamLocation.BODY)
                .equals('foo')
                .optional();

            const ctx: any = mockContext();
            await validationChain.run()(ctx, next);
            const results = validationResults(ctx);
            expect(results.hasErrors()).toBe(false);
            expect(results.array().length).toBe(0);
        });

        test('Doesn\t ignore null value', async () => {
            const validationChain = new ValidationChain('param', ParamLocation.BODY)
                .equals('foo')
                .optional();

            const ctx: any = mockContext(ParamLocation.BODY, { param: null });
            await validationChain.run()(ctx, next);
            const results = validationResults(ctx);
            expect(results.hasErrors()).toBe(true);
            expect(results.array().length).toBe(1);
        });

        test('Ignore null value when alloNull has been set', async () => {
            const validationChain = new ValidationChain('param', ParamLocation.BODY)
                .equals('foo')
                .optional({ allowNull: true });

            const ctx: any = mockContext(ParamLocation.BODY, { param: null });
            await validationChain.run()(ctx, next);
            const results = validationResults(ctx);
            expect(results.hasErrors()).toBe(false);
            expect(results.array().length).toBe(0);
        });

    });

    describe('custom()', () => {

        test('Returns errors if function throws', async () => {
            const validationChain = new ValidationChain('int', ParamLocation.BODY)
                .custom(
                    async (input: any) => {
                        if (typeof input !== 'number') {
                            throw new TypeError('Invalid number: ' + input);
                        }
                    },
                );
            const ctx: any = mockContext(ParamLocation.BODY, { int: '12' });
            await validationChain.run()(ctx, next);
            expect(validationResults(ctx).array().length).toBe(1);
        });

        test('Throws if no validation function has been defined', async () => {
            // @ts-ignore
            const validationChain = new ValidationChain('int', ParamLocation.BODY)
                .custom();
            const ctx: any = mockContext(ParamLocation.BODY, { int: '12' });
            await expect(validationChain.run()(ctx, next)).rejects.toThrow();
        });

        test(
            'Returns the default error message if no message has been passed',
            async () => {
                const validationChain = new ValidationChain('int', ParamLocation.BODY)
                    .custom(
                        async (input: any) => {
                            if (typeof input !== 'number') {
                                throw new TypeError();
                            }
                        },
                    );
                const ctx: any = mockContext(ParamLocation.BODY, { int: '12' });
                await validationChain.run()(ctx, next);
                const results = validationResults(ctx).mapped();
                expect(results).toHaveProperty('int');
                expect(results.int)
                    .toHaveProperty('msg', validationChain.defaultErrorMessage);
            },
        );

        test('Doesn\'t return errors if function doesn\'t throw', async () => {
            const validationChain = new ValidationChain('int', ParamLocation.BODY)
                .custom(
                    async (input: any) => {
                        if (isNaN(parseInt(input, 10))) {
                            throw new TypeError('Invalid number: ' + input);
                        }
                    },
                );
            const ctx: any = mockContext(ParamLocation.BODY, { int: 12 });
            await validationChain.run()(ctx, next);
            expect(validationResults(ctx).array().length).toBe(0);
        });

    });

    describe('isInt()', () => {

        test('No errors if valid integer', async () => {
            const validationChain = new ValidationChain('int', ParamLocation.BODY)
                .isInt();
            const ctx: any = mockContext(ParamLocation.BODY, { int: '12' });
            await validationChain.run()(ctx, next);
            expect(validationResults(ctx).array().length).toBe(0);
        });

        test('Returns error if not valid integer', async () => {
            const validationChain = new ValidationChain('int', ParamLocation.BODY)
                .isInt();
            const ctx: any = mockContext(ParamLocation.BODY, { int: 'abc' });
            await validationChain.run()(ctx, next);
            expect(validationResults(ctx).mapped()).toHaveProperty('int');
        });

        test('Returns error if value too small', async () => {
            const validationChain = new ValidationChain('int', ParamLocation.BODY)
                .isInt({ min: 5});
            const ctx: any = mockContext(ParamLocation.BODY, { int: '-9' });
            await validationChain.run()(ctx, next);
            expect(validationResults(ctx).mapped()).toHaveProperty('int');
        });

        test('Returns error if value too big', async () => {
            const validationChain = new ValidationChain('int', ParamLocation.BODY)
                .isInt({ max: 5 });
            const ctx: any = mockContext(ParamLocation.BODY, { int: '9' });
            await validationChain.run()(ctx, next);
            expect(validationResults(ctx).mapped()).toHaveProperty('int');
        });

    });

    describe('isLength()', () => {

        test('Returns null if value is in given length', async () => {
            const validationChain = new ValidationChain('string', ParamLocation.PARAM)
                .isLength({ min: 5, max: 7 });
            const ctx: any = mockContext(ParamLocation.PARAM, { string: 'abcabc' });
            await validationChain.run()(ctx, next);
            expect(validationResults(ctx).array().length).toBe(0);
        });

        test('Returns error if value too small', async () => {
            const validationChain = new ValidationChain('string', ParamLocation.PARAM)
                .isLength({ min: 5 });
            const ctx: any = mockContext(ParamLocation.PARAM, { string: 'ab' });
            await validationChain.run()(ctx, next);
            expect(validationResults(ctx).mapped()).toHaveProperty('string');
        });

        test('Returns error if value too big', async () => {
            const validationChain = new ValidationChain('string', ParamLocation.PARAM)
                .isLength({ max: 5 });
            const ctx: any = mockContext(ParamLocation.PARAM, { string: 'abcabc' });
            await validationChain.run()(ctx, next);
            expect(validationResults(ctx).mapped()).toHaveProperty('string');
        });

    });

    describe('isEmail()', () => {

        test('Returns null if the value is valid email', async () => {
            const validationChain = new ValidationChain('email', ParamLocation.BODY)
                .isEmail();
            const ctx = mockContext(ParamLocation.BODY, { email: 'foo@bar.com' });
            await validationChain.run()(ctx, next);
            expect(validationResults(ctx).array().length).toBe(0);
        });

        test('Returns error if the value is not valid email', async () => {
            const validationChain = new ValidationChain('email', ParamLocation.BODY)
                .isEmail();
            const ctx = mockContext(ParamLocation.BODY, { email: 'foobar.com' });
            const ctx2 = mockContext(ParamLocation.BODY, { email: 'foo@bar' });
            await validationChain.run()(ctx, next);
            await validationChain.run()(ctx2, next);
            expect(validationResults(ctx).mapped()).toHaveProperty('email');
            expect(validationResults(ctx2).mapped()).toHaveProperty('email');
        });

    });

    describe('withMessage()', () => {

        test(
            'Return the given string message when validation returns an error',
            async () => {
                const message = 'Has to be a real email';
                const validationChain = new ValidationChain('email', ParamLocation.BODY)
                    .isEmail()
                    .withMessage(message);
                const ctx = mockContext(ParamLocation.BODY, { email: 'foobar.com' });
                await validationChain.run()(ctx, next);
                const results = validationResults(ctx);
                const mappedResults = results.mapped();
                expect(mappedResults).toHaveProperty('email');
                expect(mappedResults.email).toHaveProperty('msg', message);
            },
        );

        test(
            'Return the value of given function when validation returns an error',
            async () => {
                const localizedMessage = 'This email address has already been taken:';
                const messageFn: CustomErrorMessageFunction = (context, value) =>
                    `${context.state.localizedMessage} ${value}`;
                const validationChain = new ValidationChain('email', ParamLocation.BODY)
                    .isEmail()
                    .withMessage(messageFn);

                const ctx = mockContext(
                    ParamLocation.BODY,
                    { email: 'foobar.com' },
                    { localizedMessage }, // This object goes to ctx.state
                );
                await validationChain.run()(ctx, next);
                const results = validationResults(ctx);
                const mappedResults = results.mapped();
                expect(mappedResults).toHaveProperty('email');
                expect(mappedResults.email).toHaveProperty(
                    'msg',
                    `${localizedMessage} foobar.com`,
                );
            },
        );

        test('Throws when trying to set a message with no validations', () => {
            expect(() => {
                const validationChain = new ValidationChain('param', ParamLocation.BODY)
                    .withMessage('Invalid valie');
            }).toThrowError();
        });

    });

    describe('contains()', () => {

        test('Return an error if the haystack doesn\'t contain the seed', async () => {
            const seed = 'seed';
            const haystack = 'haystack';
            const validationChain = new ValidationChain(prop, ParamLocation.BODY)
                .contains(seed);
            const ctx = mockContext(ParamLocation.BODY, { [prop]: haystack });
            await validationChain.run()(ctx, next);
            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the haystack contains the seed', async () => {
            const seed = 'seed';
            const haystack = 'hayseed';
            const validationChain = new ValidationChain(prop, ParamLocation.BODY)
                .contains(seed);
            const ctx = mockContext(ParamLocation.BODY, { [prop]: haystack });
            await validationChain.run()(ctx, next);
            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('equals', () => {

        test('Returns an error if the strings doesn\'t match', async () => {
            const comparison = 'comparison';
            const value = 'nosirapmoc';
            const validationChain = new ValidationChain(prop, ParamLocation.BODY)
                .equals(comparison);

            const ctx = mockContext(ParamLocation.BODY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the values equal', async () => {
            const comparison = 'comparison';
            const value = 'comparison';
            const validationChain = new ValidationChain(prop, ParamLocation.BODY)
                .equals(comparison);

            const ctx = mockContext(ParamLocation.BODY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isBoolean()', () => {

        test('Returns an error if the value is not boolean value', async () => {
            const value = null;
            const validationChain = new ValidationChain(prop, ParamLocation.BODY)
                .isBoolean();

            const ctx = mockContext(ParamLocation.BODY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is a boolean value', async () => {
            const value = false;
            const validationChain = new ValidationChain(prop, ParamLocation.BODY)
                .isBoolean();

            const ctx = mockContext(ParamLocation.BODY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isEmpty()', () => {

        test('Returns an error if the value is not empty', async () => {
            const value = 'value';
            const validationChain = new ValidationChain(prop, ParamLocation.BODY)
                .isEmpty();

            const ctx = mockContext(ParamLocation.BODY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is empty', async () => {
            const value = '';
            const validationChain = new ValidationChain(prop, ParamLocation.BODY)
                .isEmpty();

            const ctx = mockContext(ParamLocation.BODY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isFloat()', () => {

        test('Returns an error if the value if not float', async () => {
            const value = 'a10';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isFloat();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is a float', async () => {
            const value = '11.847';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isFloat();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isHash()', () => {

        test('Returns an error if the value if not a hash function', async () => {
            const value = md5Hash;
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isHash('sha256');
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is a hash function', async () => {
            const value = md5Hash;
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isHash('md5');
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isJWT()', () => {

        test('Returns an error if the value if not a JWT token', async () => {
            const value = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isJWT();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is a JWT token', async () => {
            // tslint:disable-next-line: max-line-length
            const value = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwicm9sZSI6IkFETUlOIiwiaXNzIjoic2VjdXJpdHktc2Vuc29yIiwiZXhwIjoxNTU0MjgzNDIzfQ.CVRGy_tlwEnpgMuvbIpAhYIsicf4uWvMqMkFXjbETpBXQ1bYuKGEquVen7AkJnQXrWFyqQKsfMucqh_y6ak4aw';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isJWT();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isJSON()', () => {

        test('Returns an error if the value if not valid JSON', async () => {
            const value = '{ "foo": "bar", }';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isJSON();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is valid JSON', async () => {
            const value = JSON.stringify({ foo: 'bar' });
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isJSON();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isLatLong()', () => {

        test('Returns an error if the value if not valid lat long', async () => {
            const value = '25.32350918, 265.239544';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isLatLong();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is valid lat long', async () => {
            const value = '25.32350918, 65.239544';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isLatLong();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isLowercase()', () => {

        test('Returns an error if the value if not lowercase', async () => {
            const value = 'camelCase';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isLowercase();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is lowecase', async () => {
            const value = 'snake_case';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isLowercase();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isMACAddress()', () => {

        test('Returns an error if the value if not valid mac address', async () => {
            const value = 'AM:PM:FF:01:93:01';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isMACAddress();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is valid mac address', async () => {
            const value = 'A0:7D:FF:01:93:01';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isMACAddress();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isMongoId()', () => {

        test('Returns an error if the value if not valid mongo id', async () => {
            const value = '54759eb3mm90d83494e2d804';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isMongoId();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is valid mongo id', async () => {
            const value = '54759eb3c090d83494e2d804';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isMongoId();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isNumeric()', () => {

        test('Returns an error if the value contains other than numbers', async () => {
            const value = '8429fa9';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isNumeric();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value contains only numbers', async () => {
            const value = '00329842313';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isNumeric();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isPort()', () => {

        test('Returns an error if the value is not a valid port number', async () => {
            const value = 'f8080';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isPort();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is a valid port number', async () => {
            const value = 8080;
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isPort();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isUUID()', () => {

        test('Returns an error if the value is not a valid UUID', async () => {
            const value = '55ae46dd-2cb0-4506-b63g-1542a7973c50';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isUUID();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is a valid UUID', async () => {
            const value = '55ae46dd-2cb0-4506-b631-1542a7973c50';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isUUID();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isUppercase()', () => {

        test('Returns an error if the value is not uppercase', async () => {
            const value = 'camelCase';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isUppercase();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is uppercase', async () => {
            const value = 'UPPERCASE';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isUppercase();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isIn()', () => {

        const allowedValues = [ 'Au', 'Fe', 'Cu' ];

        test('Returns an error if the value is not within allowed values', async () => {
            const value = 'He';

            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isIn(allowedValues);
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test(
            'Doesn\'t return an error if the value is within allowed values',
            async () => {
                const value = 'Fe';
                const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                    .isIn(allowedValues);
                const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
                await validationChain.run()(ctx, next);

                const results = validationResults(ctx);
                expect(results.mapped()).not.toHaveProperty(prop);
            },
        );

    });

    describe('matches()', () => {

        test('Returns an error if the value doesn\'t match the RegExp', async () => {
            const value = '0x9389203';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .matches(/^[0-9]{1,10}$/);
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value matches the RegExp', async () => {
            const value = '0x9389203';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .matches(/^[0-9x]{1,10}$/);
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isIn()', () => {

        test('Returns an error if the value is not in allowed values', async () => {
            const value = '313';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isIn([ '123', '321' ]);
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is in allowed values', async () => {
            const value = '321';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isIn([ '123', '321' ]);
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isAfter()', () => {

        test('Returns an error if the value is not after given date', async () => {
            const value = new Date().toString();
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isAfter();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value after given date', async () => {
            const value = new Date().toString();
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isAfter(new Date(2018).toString());
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isAlpha()', () => {

        test('Returns an error if the value is not alphabetic', async () => {
            const value = 'abcdefghijklmnopqrstyvwxyz0123';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isAlpha();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is alphabetic', async () => {
            const value = 'abcdefghijklmnopqrstyvwxyz';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isAlpha();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isAlphanumeric()', () => {

        test('Returns an error if the value is not alphanumeric', async () => {
            const value = 'abcdefghijklmnopqrstyvwxyz0123.';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isAlphanumeric();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is alphanumeric', async () => {
            const value = 'abcdefghijklmnopqrstyvwxyz0123';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isAlphanumeric();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isAscii()', () => {

        test('Returns an error if the value is not full ascii', async () => {
            const value = 'abcdefghijklmnopqrstyvwxyz0123\u00A3';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isAscii();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is ascii', async () => {
            const value = 'abcdefghijklmnopqrstyvwxyz';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isAscii();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isBase64()', () => {

        test('Returns an error if the value is not base64', async () => {
            const value = 'abcdefghijklmnopqrstyvwxyz';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isBase64();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is alphabetic', async () => {
            const value = Buffer.from('abcdefghijklmnopqrstyvwxyz').toString('base64');
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isBase64();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isBefore()', () => {

        test('Returns an error if the value is not before specified date', async () => {
            const value = new Date().toJSON();
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isBefore(new Date(2018).toJSON());
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test(
            'Doesn\'t return an error if the value is before specified date',
            async () => {
                const value = new Date(2018).toJSON();
                const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                    .isBefore(); // Defaults to current datetime
                const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
                await validationChain.run()(ctx, next);

                const results = validationResults(ctx);
                expect(results.mapped()).not.toHaveProperty(prop);
            },
        );

    });

    describe('isByteLength()', () => {

        test('Returns an error if the value is not sepcified byte length', async () => {
            const value = 'abcdefg';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isByteLength({ min: 8, max: 128 });
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test(
            'Doesn\'t return an error if the value is specified byte length',
            async () => {
                const value = 'abcdefghij';
                const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                    .isByteLength(); // Defaults to { min: 0 }
                const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
                await validationChain.run()(ctx, next);

                const results = validationResults(ctx);
                expect(results.mapped()).not.toHaveProperty(prop);
            },
        );

    });

    describe('isCreditCard()', () => {

        test('Returns an error if the value is not credit card', async () => {
            const value = '455623474723412331324';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isCreditCard();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is credit card', async () => {
            const value = '4556234747234123';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isCreditCard();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isCurrency()', () => {

        test('Returns an error if the value is not currency', async () => {
            const value = '$12.9000';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isCurrency();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is currency', async () => {
            const value = '$12.90';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isCurrency();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isDataURI()', () => {

        test('Returns an error if the value is not data URI', async () => {
            const value = 'data:base64,iVBORw0KGgoAAA';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isDataURI();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is data URI', async () => {
            // tslint:disable-next-line: max-line-length
            const value = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isDataURI();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isDecimal()', () => {

        test('Returns an error if the value is not decimal number', async () => {
            const value = '0x01';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isDecimal();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is decimal number', async () => {
            const value = '3.134';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isDecimal();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isDivisibleBy()', () => {

        test(
            'Returns an error if the value is not divisible by given number',
            async () => {
                const value = '7';
                const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                    .isDivisibleBy(5);
                const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
                await validationChain.run()(ctx, next);

                const results = validationResults(ctx);
                expect(results.mapped()).toHaveProperty(prop);
            },
        );

        test(
            'Doesn\'t return an error if the value is divisible by given number',
            async () => {
                const value = '15';
                const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                    .isDivisibleBy(5);
                const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
                await validationChain.run()(ctx, next);

                const results = validationResults(ctx);
                expect(results.mapped()).not.toHaveProperty(prop);
            },
        );

    });

    describe('isFQDN()', () => {

        test(
            'Returns an error if the value is not fully qualified domain name',
            async () => {
                const value = 'notarealdomainname';
                const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                    .isFQDN();
                const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
                await validationChain.run()(ctx, next);

                const results = validationResults(ctx);
                expect(results.mapped()).toHaveProperty(prop);
            },
        );

        test('Doesn\'t return an error if the value is currency', async () => {
            const value = 'qualifieddomain.name';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isFQDN();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isFullWidth()', () => {

        test('Returns an error if the value contains none full width chars', async () => {
            const value = 'above';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isFullWidth();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test(
            'Doesn\'t return an error if the value contains any full width chars',
            async () => {
                const value = 'ａｂｏｖｅ';
                const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                    .isFullWidth();
                const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
                await validationChain.run()(ctx, next);

                const results = validationResults(ctx);
                expect(results.mapped()).not.toHaveProperty(prop);
            },
        );

    });

    describe('isHalfWidth()', () => {

        test('Returns an error if the value contains none half width chars', async () => {
            const value = 'ａｂｏｖｅ';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isHalfWidth();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test(
            'Doesn\'t return an error if the value contains any half width chars',
            async () => {
                const value = 'abｏｖｅ';
                const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                    .isHalfWidth();
                const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
                await validationChain.run()(ctx, next);

                const results = validationResults(ctx);
                expect(results.mapped()).not.toHaveProperty(prop);
            },
        );

    });

    describe('isHexColor()', () => {

        test('Returns an error if the value is not a hex color', async () => {
            const value = '#99999g';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isHexColor();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is a hex color', async () => {
            const value = '#9e9392';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isHexColor();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isHexadecimal()', () => {

        test('Returns an error if the value is not hexadecimal', async () => {
            const value = 'E892G9';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isHexadecimal();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is hexadecimal', async () => {
            const value = 'D839E';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isHexadecimal();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isIP()', () => {

        test('Returns an error if the value is not an IPv4 address', async () => {
            const value = '256.255.255.255';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isIP(4);
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Returns an error if the value is not an IPv6 address', async () => {
            const value = 'ffff0::';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isIP(6);
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is an IPv4 address', async () => {
            const value = '255.255.255.255';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isIP(4);
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is an IPv6 address', async () => {
            const value = '::1';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isIP(6);
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isIPRange()', () => {

        test('Returns an error if the value is not an IP range', async () => {
            const value = '255.255.255.255/64';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isIPRange();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is an IP range', async () => {
            const value = '255.255.255.255/24';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isIPRange();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isISBN()', () => {

        test('Returns an error if the value is not valid ISBN 10', async () => {
            const value = '978-951-98548-9-2';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isISBN(10);
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is valid ISBN 13', async () => {
            const value = '978-951-98548-9-2';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isISBN(13);
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isISSN()', () => {

        test('Returns an error if the value is not valid ISSN', async () => {
            const value = '3910-938X';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isISSN();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is valid ISSN', async () => {
            const value = '3910-9380';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isISSN();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isISIN()', () => {

        test('Returns an error if the value is not valid ISIN', async () => {
            const value = 'US0378331009';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isISIN();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value valid ISIN', async () => {
            const value = 'US0378331005';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isISIN();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isISO8601()', () => {

        test('Returns an error if the value is not valid ISO8601 date', async () => {
            const value = new Date().getTime().toString();
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isISO8601();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is valid ISO8601 date', async () => {
            const value = new Date().toJSON();
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isISO8601();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isRFC3339()', () => {

        test('Returns an error if the value is not valid RFC3339 date', async () => {
            const value = new Date().getTime().toString();
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isRFC3339();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is valid RFC3339 date', async () => {
            const value = new Date().toJSON();
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isRFC3339();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isISO31661Alpha2()', () => {

        test(
            'Returns an error if the value is not valid ISO 3166-1 alpha 2 country code',
            async () => {
                const value = 'fi-FI';
                const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                    .isISO31661Alpha2();
                const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
                await validationChain.run()(ctx, next);

                const results = validationResults(ctx);
                expect(results.mapped()).toHaveProperty(prop);
            },
        );

        test(
            'Doesn\'t return an error if the value is valid '
            + 'ISO 3166-1 alpha 2 country code',
            async () => {
                const value = 'fi';
                const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                    .isISO31661Alpha2();
                const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
                await validationChain.run()(ctx, next);

                const results = validationResults(ctx);
                expect(results.mapped()).not.toHaveProperty(prop);
            },
        );

    });

    describe('isISRC()', () => {

        test('Returns an error if the value is not valid ISRC code', async () => {
            const value = 'enUSRC17609830';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isISRC();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is valid ISRC code', async () => {
            const value = 'USRC17609830';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isISRC();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isMD5()', () => {

        test('Returns an error if the value is not valid MD5 hash', async () => {
            const value = 'e948c22100d29623a1df48e1760494dfbb';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isMD5();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is valid MD5 hash', async () => {
            const value = 'e948c22100d29623a1df48e1760494df';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isMD5();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isMimeType()', () => {

        test('Returns an error if the value is not valid MIME type', async () => {
            const value = 'foo/invalid';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isMimeType();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is valid MIME type', async () => {
            const value = 'image/png';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isMimeType();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isMobilePhone()', () => {

        test('Returns an error if the value is not a valid E.164 number', async () => {
            const value = '+999401231239';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isMobilePhone();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test(
            'Doesn\'t return an error if the value is a valid E.164 number',
            async () => {
                const value = '+358401231231';
                const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                    .isMobilePhone();
                const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
                await validationChain.run()(ctx, next);

                const results = validationResults(ctx);
                expect(results.mapped()).not.toHaveProperty(prop);
            },
        );

    });

    describe('isMultibyte()', () => {

        test(
            'Returns an error if the value doesn\'t contain moltibyte chars',
            async () => {
                const value = 'asba+1';
                const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                    .isMultibyte();
                const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
                await validationChain.run()(ctx, next);

                const results = validationResults(ctx);
                expect(results.mapped()).toHaveProperty(prop);
            },
        );

        test(
            'Doesn\'t return an error if the value contains multibyte chars',
            async () => {
                const value = '1230v𝌆';
                const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                    .isMultibyte();
                const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
                await validationChain.run()(ctx, next);

                const results = validationResults(ctx);
                expect(results.mapped()).not.toHaveProperty(prop);
            },
        );

    });

    describe('isPostalCode()', () => {

        test('Returns an error if the value is not a postal code', async () => {
            const value = '10000000';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isPostalCode();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is a postal code', async () => {
            const value = '90 000';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isPostalCode();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isSurrogatePair()', () => {

        test(
            'Returns an error if the value doesn\'t contain surrogate pairs',
            async () => {
                const value = '+999401231239';
                const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                    .isSurrogatePair();
                const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
                await validationChain.run()(ctx, next);

                const results = validationResults(ctx);
                expect(results.mapped()).toHaveProperty(prop);
            },
        );

        test(
            'Doesn\'t return an error if the value contains surrogate pairs',
            async () => {
                const value = 'In the game of mahjong 🀜 denotes the Four of circles';
                const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                    .isSurrogatePair();
                const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
                await validationChain.run()(ctx, next);

                const results = validationResults(ctx);
                expect(results.mapped()).not.toHaveProperty(prop);
            },
        );

    });

    describe('isURL()', () => {

        test('Returns an error if the value is not an URL', async () => {
            const value = 'invalid://localhost';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isURL();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is an URL', async () => {
            const value = 'http://example.com';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isURL();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isVariableWidth()', () => {

        test('Returns an error if the value is not variable width', async () => {
            const value = '+999401231239';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isVariableWidth();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is variable width', async () => {
            const value = 'abｏｖｅ';
            const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                .isVariableWidth();
            const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isWhitelisted()', () => {

        test(
            'Returns an error if the value doesn\'t contain only whitelisted chars',
            async () => {
                const value = 'Lazy fox';
                const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                    .isWhitelisted(['a', 'b', 'c']);
                const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
                await validationChain.run()(ctx, next);

                const results = validationResults(ctx);
                expect(results.mapped()).toHaveProperty(prop);
            },
        );

        test(
            'Doesn\'t return an error if the value contains only whitelisted chars',
            async () => {
                const value = 'Lazy fox';
                const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
                    .isWhitelisted('afLoxzy ');
                const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
                await validationChain.run()(ctx, next);

                const results = validationResults(ctx);
                expect(results.mapped()).not.toHaveProperty(prop);
            },
        );

    });

});