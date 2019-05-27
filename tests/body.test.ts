import { body } from '../src';
import ValidationChain from '../src/lib/ValidationChain';

describe('body()', () => {

    test('Returns a new ValidationChain', () => {
        const chain = body('prop');
        expect(chain).toBeInstanceOf(ValidationChain);
    });

});
