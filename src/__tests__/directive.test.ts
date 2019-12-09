import { ComponentEngine } from '../core/engine/componentEngine';
import { State } from '../core/state';
import { NailsDirectives } from '../directives/directiveDefinitions';
import { Nails } from '../nails';

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
    onInit() { },
    // tslint:disable-next-line: no-empty
    onMounted(currentState: State) { },
  },
};
const nails = new Nails(nailsConfig);
const testText = 'lorem {{ipsum}} {{ dolor}} {{sit}} {amet}';
const element = document.createElement('div');
const componentEngine = new ComponentEngine(nails.state, nails.engine, nails, []);
const directives = new NailsDirectives();
nails.state.data.test = 'worked';

it('should mount directives', () => {
  const text = document.createElement('input');
  text.setAttribute('type', 'text');
  expect(directives).toBeDefined();
  expect(directives.directives).toHaveLength(5);
  expect(directives.click(element, 'test()', nails.state)).toBeFalsy();
  expect(directives.form(text, '', nails.state)).toBeFalsy();
  expect(directives.form(text, '', nails.state)).toBeFalsy();

  expect(directives.change(element as HTMLInputElement, '', nails.state)).toBeFalsy();
  expect(directives.click(element, '', nails.state)).toBeFalsy();
});

it('should render n-for', () => {
  const tElement = document.createElement('option');
  const parent = document.createElement('select');
  tElement.innerHTML = `
      {{a}} {{test}}
  `;
  tElement.setAttribute('n-for', 'let a of [1,2,3,4]');
  tElement.setAttribute('id', '{{a}}');
  parent.appendChild(tElement);

  directives.for(tElement, 'let a of [1,2,3,4]', nails.state);
  console.warn(parent.innerHTML);
  expect(parent.children.length === 5);
  expect(parent.children[1].innerHTML).toContain('worked');
});

it('should resolve n-for', () => {
  const parent = document.createElement('div');
});
