'use strict';
import 'ts-polyfill/lib/es2016-array-include';
import 'ts-polyfill/lib/es2017-object';
import 'ts-polyfill/lib/es2017-string';
import 'ts-polyfill/lib/es2018-async-iterable'; // for-await-of
import 'ts-polyfill/lib/es2018-promise';
import 'ts-polyfill/lib/es2019-array';
import 'ts-polyfill/lib/es2019-object';
import 'ts-polyfill/lib/es2019-string';
import 'ts-polyfill/lib/es2020-string';
import { ComponentEngine } from './core/engine/componentEngine';
import { RenderingEngine } from './core/engine/engine';
import { Injector } from './core/injector';
import { State } from './core/state';

class Factory {
  public create<T>(type: new () => T): T {
    return new type();
  }
}

// tslint:disable-next-line:max-classes-per-file
export class Nails {
  public state: State;
  public engine: RenderingEngine;
  public componentEngine: ComponentEngine;
  public injector: Injector;

  constructor(object: any) {
    this.state = new State();

    if (typeof object.methods.onInit !== 'undefined') {
      object.methods.onInit();
    }
    if (object.hasOwnProperty('el')) {
      this.state.element = object.el;
    } else {
      console.error('NailsJS cannot be initalized, because no element was specified');
    }
    if (object.hasOwnProperty('data')) {
      this.state.data = object.data;
    }
    if (object.hasOwnProperty('methods')) {
      this.state.methods = object.methods;
    }
    if (typeof object.components === 'undefined') {
      this.state.components = [];
    } else {
      if (Array.isArray(object.components)) {
        this.state.components = object.components;
      } else {
        this.state.components = [];
      }
    }
    this.engine = new RenderingEngine(this.state);
    this.componentEngine = new ComponentEngine(this.state, this.engine, this, object.routings);
    this.setUpProxy();
    this.injector = new Injector(this.state);
    this.prepareInjector(object.declarations);
    this.state.addInjector(this.injector);
    this.engine.indexDOM();
    this.componentEngine.renderComponents();
    this.engine.setTitle();
    this.state.methods.getState = function () {
      return this.state;
    };
    if (typeof this.state.methods.onMounted !== 'undefined') {
      this.state.methods.onMounted(this.state);
    }
  }

  public prepareInjector(arr: []) {
    const factory = new Factory();
    if (!Array.isArray(arr)) {
      console.warn('Cannot iterate over declarations, since they are not an array');
      return;
    }
    for (const d of arr) {
      const instance = factory.create(d);
      this.injector.insert(instance);
    }
  }

  public notifyDOM(target: any, prop: any, value: string) {
    const refs = this.state.findElementsByObject(target, prop);
    if (refs === [] || refs.length === 0) {
      return;
    }
    for (const ref of refs) {
      this.engine.updateInterpolatedElement(ref.element, ref.content);
      this.engine.executeDirectivesOnElement(ref.element, false);
    }

    return true;
  }
  public setUpProxy() {
    if (typeof window.Proxy !== 'undefined') {
      const handler = {
        state: this.state,
        // tslint:disable-next-line: object-literal-sort-keys
        notifyDom: this.notifyDOM,
        engine: this.engine,

        get(target: any, prop: any, receiver: any) {
          return target[prop];
        },
        set(target: any, prop: any, value: string) {
          target[prop] = value;
          this.notifyDom(target, prop, '');
          return true;
        },
      };

      const proxy = new Proxy(this.state.data, handler);
      this.state.data = proxy;
    }
  }
}
