import { query } from '../src';
import ValidationChain from '../src/lib/ValidationChain';

describe('query()', () => {

    test('Returns a new ValidationChain', () => {
        const chain = query('prop');
        expect(chain).toBeInstanceOf(ValidationChain);
    });

});
