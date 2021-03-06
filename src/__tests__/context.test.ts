import { CoreComponent } from '../core/components/core.component';
import { Context } from '../core/context/context';
import { ComponentEngine } from '../core/engine/componentEngine';
import { State } from '../core/state';
import { MockComponent } from '../mocks/mock.component';
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
    resolve: {
      does: {
        work() {
          return 'yes';
        },
      },
    },
    res: {
      does() {
        return {
          work: function() {
            return 'yes';
          },
        };
      },
    },
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
// tslint:disable-next-line:max-line-length
const instance = componentEngine.getInstanceFromInstanceId(
  componentEngine.setInstanceIdOnElement(element, new MockComponent(nails.state)),
);

it('should resolve properties', () => {
  let context = new Context(nails.state, instance);
  const resolve = 'resolve.does.work()';
  expect(context.resolveOrUndefined(resolve)).toBe('yes');
  expect(context.resolveOrUndefined('res.does().work()')).toBe('yes');
  context = new Context(nails.state, instance);
  expect(context.resolveOrUndefined('ins.work')).toBe('true');
});
