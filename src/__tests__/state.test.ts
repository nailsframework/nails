import { State } from '../core/state';
import { Nails } from '../nails';
import { ComponentEngine } from '../core/engine/componentEngine';
import { Injector } from '../core/injector';

const nailsConfig = {
  el: 'body',
  // tslint:disable-next-line: object-literal-sort-keys
  data: {
    ipsum: '1',
    // tslint:disable-next-line: object-literal-sort-keys
    dolor: '2',
    sit: '3',
    amet: '4',
  },
  methods: {
    // tslint:disable-next-line: no-empty
    onInit() {},
    // tslint:disable-next-line: no-empty
    onMounted(currentState: State) {},
  },
};
const nails = new Nails(nailsConfig);
const element = document.createElement('div');
const componentEngine = new ComponentEngine(nails.state, nails.engine, nails, []);

it('should add active element', () => {
  nails.state.addActiveElement(element, {}, 'abc {{abc}}', '{{abc}}');
  expect(nails.state.activeElements).toHaveLength(1);
});

it('should find active element', () => {
  expect(nails.state.findElementsByObject(null, '')).toHaveLength(0);
});

it('should disable element', () => {
  nails.state.engine.disableInterpolationForVariableNameOnElement('abc', element);
  expect(nails.state.disabledElements).toHaveLength(1);
});

it('should ', () => {
  nails.state.addInjector(new Injector(nails.state));
  expect(nails.state.injector).toBeTruthy();
});
