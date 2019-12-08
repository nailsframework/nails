'use strict';
import { Instance } from '../classes/Instance';
import { Context } from '../core/context/context';
import { ComponentEngine } from '../core/engine/componentEngine';
import { RenderingEngine } from '../core/engine/engine';
import { State } from '../core/state';
import { ForImplementation } from './implementations/for';
export class NailsDirectives {
  public directives: any;
  constructor() {
    this.directives = ['if', 'form', 'for', 'click', 'change'];
  }
  /*
          A directive consists of an element (string) in the @directives array and a function declaration
          below.
          directive and function need to have the same name
          sample body:
          sample(element, statement, state){
  
          }
          where element is the element where the directive is added and statemenet
          what has been declaired.
          sample arguments
          element = h1 reference
          statement = var object of objects
          state = current state
  
          For reactivness, only use elements in the data object within the state, as these
          are actively monitored.
  
          DONT PREFIX YOUR DIRECTIVE AND FUNCTIONS WITH AN N
      */

  public click(element: HTMLElement, statement: string, state: State) {
    const componentEngine = new ComponentEngine(state, new RenderingEngine(state), null, []);

    if (!state.click) {
      state.click.callbacks = [];
    }
    const callback = () => {
      const instance = componentEngine.getInstanceOfElementOrNull(element) as Instance;

      if (instance !== null) {
        // tslint:disable-next-line: no-eval
        eval('instance.getComponent().' + statement);
        return;
      }
      // tslint:disable-next-line: no-eval
      eval('state.methods.' + statement);
    };
    element.onclick = callback;
  }
  public change(element: HTMLInputElement, statement: string, state: State) {
    const callback = () => {
      // tslint:disable-next-line: no-eval
      eval('state.methods.' + statement + '(' + element.value + ')');
    };
    element.onchange = callback;
  }
  public form(element: HTMLInputElement, statement: string, state: State) {
    if (element.getAttribute('type') === 'text') {
      if (state.data[statement] !== element.value) {
        state.data[statement] = element.value;
      }
    }
    element.addEventListener('input', () => {
      if (state.data[statement] !== element.value) {
        state.data[statement] = element.value;
      }
    });
  }

  public for(element: HTMLElement, statement: string, state: State) {
    const implementation = new ForImplementation(state, element, statement);
    implementation.run();
  }
  public if(element: HTMLElement, statement: string, state: State) {
    if (statement === 'true' || statement === 'false') {
      if (statement === 'true') {
        element.style.visibility = 'visible';

        return;
      } else {
        element.style.visibility = 'hidden';

        return;
      }
    }

    let reversed = false;
    if (statement[0] === '!') {
      statement = statement.substring(1);
      reversed = true;
    }
    const componentEngine = new ComponentEngine(state, new RenderingEngine(state), null, null);

    // tslint:disable-next-line:max-line-length
    const context = new Context(state, componentEngine.getInstanceOfElementOrNull(element));
    if (context.resolveOrUndefined(statement)) {
      if (reversed) {
        // tslint:disable-next-line:no-eval
        if (!eval(state.data[statement])) {
          element.style.visibility = 'visible';
        } else {
          element.style.visibility = 'hidden';
        }
      } else {
        // tslint:disable-next-line:no-eval
        if (eval(state.data[statement])) {
          element.style.visibility = 'visible';
        } else {
          element.style.visibility = 'hidden';
        }
      }
    } else {
      element.style.visibility = 'hidden';
    }
  }
}
