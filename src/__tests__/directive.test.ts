import { State } from '../core/state';
import { Nails } from '../nails';
import { ComponentEngine } from '../core/engine/componentEngine';
import { NailsDirectives } from '../directiveDefinitions';

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
const testText = 'lorem {{ipsum}} {{ dolor}} {{sit}} {amet}';
const element = document.createElement('div');
const componentEngine = new ComponentEngine(nails.state, nails.engine, nails, []);
const directives = new NailsDirectives();

it('should mount directives', () => {
  const text = document.createElement('input');
  text.setAttribute('type', 'text');
  expect(directives).toBeDefined();
  expect(directives.directives).toHaveLength(5);
  expect(directives.click(element, 'test()', nails.state)).toBeFalsy();
  expect(directives.for(element, 'let a of b', nails.state)).toBeFalsy();
  expect(directives.form(text, '', nails.state)).toBeFalsy();
  expect(directives.form(text, '', nails.state)).toBeFalsy();

  expect(directives.change(element as HTMLInputElement, '', nails.state)).toBeFalsy();
  expect(directives.click(element, '', nails.state)).toBeFalsy();
});
