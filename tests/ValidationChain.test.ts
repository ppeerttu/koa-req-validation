import ValidationChain from "../src/lib/ValidationChain";
import { ParamLocation } from "../src/lib/types";
import { mockContext } from "./helpers";
import { validationResults } from "../src";

/**
 * Mock next function
 */
const next = async () => {};

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
 * ValidationChain
 */
describe('ValidationChain', () => {

    describe('constructor()', () => {

        test('Constructs without exceptions', () => {
            expect(() => {
                new ValidationChain('param', ParamLocation.BODY);
            }).not.toThrow();
        });
    
        test('Throws a TypeError with invalid parameters', () => {
            expect(() => {
                const location: any = 'invalid';
                new ValidationChain('param', location);
            }).toThrow(TypeError);
        });  
  
    });

    describe('Chaining', () => {

        test('Stores validations', async () => {
            const validationChain = new ValidationChain('param', ParamLocation.BODY)
                .contains('seed')
                .equals('foo');
    
            const ctx: any = mockContext();
            await validationChain.run()(ctx, next);
            const results = validationResults(ctx);
            expect(results.hasErrors()).toBe(true);
            expect(results.array().length).toBe(2);
            expect(Object.keys(results.mapped()).length).toBe(1);
        });

        test('Combines previous chain results', async () => {
            const validationChain = new ValidationChain('param', ParamLocation.BODY)
                .contains('seed')
                .equals('foo');
            const validationChain2 = new ValidationChain('param2', ParamLocation.PARAM)
                .isInt();

            const ctx: any = mockContext();
            await validationChain.run()(ctx, next);
            await validationChain2.run()(ctx, next);
            const results = validationResults(ctx);
            expect(results.hasErrors()).toBe(true);
            expect(Object.keys(results.mapped()).length).toBe(2);
            expect(results.array().length).toBe(3);
        });

    });

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
                    }
                );
            const ctx: any = mockContext(ParamLocation.BODY, { int: '12' });
            await validationChain.run()(ctx, next);
            expect(validationResults(ctx).array().length).toBe(1);
        });

        test('Throws if no validation function has been defined', async () => {
            // @ts-ignore
            const validationChain = new ValidationChain('int', ParamLocation.BODY).custom();
            const ctx: any = mockContext(ParamLocation.BODY, { int: '12' });
            await expect(validationChain.run()(ctx, next)).rejects.toThrow();
        });


        test('Doesn\'t return errors if function doesn\'t throw', async () => {
            const validationChain = new ValidationChain('int', ParamLocation.BODY)
                .custom(
                    async (input: any) => {
                        if (isNaN(parseInt(input))) {
                            throw new TypeError('Invalid number: ' + input);
                        }
                    }
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

        test('Return the given message when validation returns an error', async () => {
            const message = 'Has to be a real email';
            const validationChain = new ValidationChain('email', ParamLocation.BODY)
                .isEmail()
                .withMessage(message)
            const ctx = mockContext(ParamLocation.BODY, { email: 'foobar.com' });
            await validationChain.run()(ctx, next);
            const results = validationResults(ctx);
            const mappedResults = results.mapped();
            expect(mappedResults).toHaveProperty('email');
            expect(mappedResults.email).toHaveProperty('msg', message);
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

});