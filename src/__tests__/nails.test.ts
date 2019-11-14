import { State } from '../core/state';
import { Nails } from '../nails';
class Sample {
  constructor() {

  }
}

const nailsConfig = {
  el: 'body',
  methods: {
    // tslint:disable-next-line: no-empty
    onInit() { },
    // tslint:disable-next-line: no-empty
    onMounted(currentState: State) { },
  },
  // tslint:disable-next-line:object-literal-sort-keys
  declarations: [Sample]
};



const nails = new Nails(nailsConfig);

it('should mount nails', () => {
  expect(nails).toBeDefined();
  expect(nails.componentEngine).toBeDefined();
  expect(nails.engine).toBeDefined();
  expect(nails.injector).toBeDefined();
});

it('should inject deps', () => {
  const instance = new Sample();

  expect(nails.injector).toBeDefined();
  expect(nails.injector.resolve(Sample)).toBeDefined();
  expect(nails.injector.state).toBeDefined();
  expect(nails.injector.insert(Sample)).toBeFalsy();
  expect(nails.state.injectors).toHaveLength(1);
});
