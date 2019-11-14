import { State } from '../core/state';
import { Nails } from '../nails';
import { Router } from '../core/components/router.component';
import { MockComponent } from '../mocks/mock.component';
class Sample {
    constructor() { }
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
    declarations: [Sample],
    components: [Router, MockComponent],
    routings: [
        {
            route: 'test',
            component: MockComponent,
        },
    ],
};

const nails = new Nails(nailsConfig);
const router = new Router(nails.state);
it('should navigate', () => {
    expect(router.navigate('/test')).toBeFalsy();
    expect(router.getComponent()).toBe('div');
    expect(router.engine).toBeDefined();
    expect(router.hashRoute).toContain('');
    expect(router.routings).toBeUndefined();
    expect(router.state).toBeDefined();
    expect(router.getHashRoute()).toBe('test');
    expect(router.isFunction(function () { })).toBeTruthy();
});

it('should inject deps', () => {
    const instance = new Sample();

    expect(nails.injector).toBeDefined();
    expect(nails.injector.resolve(Sample)).toBeDefined();
    expect(nails.injector.state).toBeDefined();
    expect(nails.injector.insert(Sample)).toBeFalsy();
    expect(nails.state.injectors).toHaveLength(1);
});
