import { Guid } from '../core/math/Guid';
test('My Greeter', () => {
    expect(Guid.newGuid()).toBeTruthy();
});