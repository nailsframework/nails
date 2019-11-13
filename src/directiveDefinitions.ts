'use strict';
import { Instance } from './classes/Instance';
import { ComponentEngine } from './core/engine/componentEngine';
import { RenderingEngine } from './core/engine/engine';
import { State } from './core/state';
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
      const context = componentEngine.getInstanceOfElementOrNull(element) as Instance;
      if (context !== null) {
        // tslint:disable-next-line: no-eval
        eval('context.getComponent().' + statement);
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

  public for(element: HTMLElement, statemenet: string, state: State) {
    console.log('called')
    const engine = new RenderingEngine(state);
    engine.disableInterpolationForVariableNameOnElement(statemenet.split(' ')[1], element);

    element.style.display = 'none';
    // tslint:disable-next-line: no-shadowed-variable
    function interpolateCustomElement(
      el: HTMLElement,
      object: any,
      // tslint:disable-next-line: no-shadowed-variable
      descriptor: any,
    ) {
      // Performancewise, we render the whole html element.
      let html = el.innerHTML;
      const interpolations = engine.getInterpolationsForTextContent(html);
      for (const interpolation of interpolations) {
        let stripped = engine.stripAndTrimInterpolation(interpolation);
        const args = stripped.split('.');
        args[0] = '';
        stripped = '';
        for (const arg of args) {
          stripped += arg + '.';
        }
        stripped = stripped.substring(0, stripped.length - 1);

        if (engine.getValueOfInterpolation(interpolation, element) !== 'undefined') {
          html = html.replace(interpolation, engine.getValueOfInterpolation(interpolation, element));
        } else {
          // tslint:disable: no-eval
          html = html.replace(interpolation, engine.sanitize(eval('object' + stripped)));
        }
      }
      el.innerHTML = html;
    }
    const descriptor = statemenet.split(' ')[1];
    const arr = statemenet.split(' ')[3];
    const refArray = eval('state.data.' + arr);
    if (typeof refArray === 'undefined' || refArray === null) {
      return;
    }

    const parent = element.parentNode;
    for (const i of refArray) {
      const child = document.createElement(element.nodeName);
      child.innerHTML = element.innerHTML;
      interpolateCustomElement(child, i, descriptor);
      parent.appendChild(child);
      engine.disableInterpolationForVariableNameOnElement(statemenet.split(' ')[1], child);

      for (const attr of element.attributes) {
        if (attr.name !== 'n-for' && attr.name !== 'style') {
          child.setAttribute(attr.name, attr.value);
        }
      }
      const componentEngine = new ComponentEngine(state, engine, null, null);
      componentEngine.traverseElementAndExecuteDirectives(child);
      // engine.executeDirectivesOnElement(child, true)
    }
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
    if (state.data.hasOwnProperty(statement)) {
      if (reversed) {
        if (!eval(state.data[statement])) {
          element.style.visibility = 'visible';
        } else {
          element.style.visibility = 'hidden';
        }
      } else {
        if (eval(state.data[statement])) {
          element.style.visibility = 'visible';
        } else {
          element.style.visibility = 'hidden';
        }
      }
    } else {
      console.warn('statement: ' + statement + ' not found in context');
    }
  }
}
