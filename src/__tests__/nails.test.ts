import { State } from '../core/state';
import { Nails } from '../nails';
const nailsConfig = {
  el: 'body',
  methods: {
    // tslint:disable-next-line: no-empty
    onInit() { },
    // tslint:disable-next-line: no-empty
    onMounted(currentState: State) { },
  },
};

const nails = new Nails(nailsConfig);

it('should mount nails', () => {
  expect(nails).toBeDefined();
  expect(nails.componentEngine).toBeDefined();
  expect(nails.engine).toBeDefined();
  expect(nails.injector).toBeDefined();
});

it('should inject deps', () => {
  expect(nails.injector).toBeDefined();
  expect(nails.injector.bootstrap()).toBeFalsy();
  expect(nails.injector.insert(Nails)).toBeFalsy();
  expect(nails.injector.resolve(Nails)).toBeUndefined();
});
