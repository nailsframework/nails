import { Guid } from '../core/math/Guid';

test('Guid generation', () => {
    expect(Guid.newGuid()).toBeTruthy();
});
