'use strict';
import { ActiveElement } from '../classes/ActiveElement';
import { Instance } from '../classes/Instance';
import { Router } from '../core/components/router.component';
import { Injector } from '../core/injector';
import { IActiveElement } from '../interfaces/ActiveElement';
import { IComponent } from '../interfaces/Component';
import { Context } from './context/context';
import { ComponentEngine } from './engine/componentEngine';
import { RenderingEngine } from './engine/engine';

export class State {
  public instance: State;
  public data: any;
  public activeElements: IActiveElement[];
  public activeDirectiveElements: IActiveElement[];
  public engine: RenderingEngine;
  public disabledElements: ActiveElement[];
  public componentEngine: ComponentEngine;
  public injector: Injector;
  public element: string;
  public methods: any;
  public components: any;
  public mountedComponents: any;
  public router: Router;
  public click: any = {};
  public injectors: any[];
  public instances: Instance[] = [];
  constructor() {
    this.data = {};
    this.activeElements = [];
    this.activeDirectiveElements = [];
    this.engine = new RenderingEngine(this);
    this.disabledElements = [];
    this.componentEngine = new ComponentEngine(this, this.engine, null, []);
  }

  public getInstance() {
    if (this.instance === null) {
      this.instance = new State();
    }
    return this.instance;
  }
  public addInjector(injector: Injector) {
    this.injector = injector;
  }
  public addActiveDirectiveElement(key: string, statement: string, element: HTMLElement) {
    for (const el of this.activeDirectiveElements) {
      if (el.key === key && el.statement === statement && el.element === element) {
        return;
      }
    }

    const activeElement = new ActiveElement(element, '', '', '', key, statement);

    this.activeDirectiveElements.push(activeElement);
  }

  public updateElementRefByObject(object: any, ref: HTMLElement) {
    for (const element of this.activeElements) {
      if (element.element === ref) {
        element.reference = object;
      }
    }
  }

  public addActiveElement(ref: HTMLElement, object: any, content: string, interpolation: string) {
    const activeElement = new ActiveElement(ref, object, content, interpolation, '', '');
    this.activeElements.push(activeElement);
  }

  public findElementByRef(ref: HTMLElement) {
    for (const element of this.activeElements) {
      if (element.reference === ref) {
        return element;
      }
    }
  }
  public getHtmlReferenceOfStateElement(element: ActiveElement) {
    return element.reference;
  }
  public stripAndTrimInterpolation(interpolation: string) {
    if (typeof interpolation !== 'string') {
      return interpolation;
    }
    interpolation = interpolation.replace('{{', '');
    interpolation = interpolation.replace('}}', '');
    interpolation = interpolation.trim();
    return interpolation;
  }

  public disableElementIfNeeded(element: HTMLElement) {
    if ('getAttribute' in element) {
      const statement = element.getAttribute('n-for');
      if (statement === null) {
        return;
      }
      const statementSplit = statement.split(' ');
      const name = statementSplit[1]; // var name of array
      this.engine.disableInterpolationForVariableNameOnElement(name, element);
    }
  }
  public findElementsByObject(obj: any, prop: string) {
    const elements = [];
    console.log('active elements are: ');
    console.log(this.activeElements);
    const context = new Context(this, null);
    for (const element of this.activeElements) {
      if (context.stripFunctionCalls(this.stripAndTrimInterpolation(element.interpolation)) === prop) {
        elements.push(element);
      }
    }

    for (const element of this.activeDirectiveElements) {
      prop = prop.replace('!', '');
      element.statement = element.statement.replace('!', '');
      if (this.stripAndTrimInterpolation(element.statement) === prop) {
        const activeElement = new ActiveElement(element.element, obj, element.element.innerText, '', '', '');
        elements.push(activeElement);
      }
    }

    return elements;
  }

  public getAttributesByInstanceId(instanceID: string): NamedNodeMap {
    return this.componentEngine.getElementAttributesByInstanceId(instanceID);
  }
  public getAttributesByInstance(component: IComponent): NamedNodeMap {
    return this.componentEngine.getElementAttributesByInstance(component);
  }
}
