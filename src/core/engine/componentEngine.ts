import { exportAllDeclaration, inheritInnerComments } from '@babel/types';
import { Instance } from '../../classes/Instance';
import { IComponent } from '../../interfaces/Component';
import { Nails } from '../../nails';
import { CoreComponent } from '../components/core.component';
import { Router } from '../components/router.component';
import { Guid } from '../math/Guid';
import { State } from '../state';
import { RenderingEngine } from './engine';

export class ComponentEngine {
  public state: State;
  public engine: RenderingEngine;
  public nails: Nails;
  public routings: any;
  public instance: ComponentEngine;
  public renderedElements: HTMLElement[] = [];

  constructor(state: State, engine: RenderingEngine, nails: Nails, routings: any) {
    this.state = state;
    this.engine = engine;
    this.instance = this;
    this.nails = nails;
    this.routings = routings;
  }

  public getInstance() {
    return this.instance;
  }

  public injectComponents() {
    if (Array.isArray(this.state.mountedComponents)) {
      return;
    }
    this.state.mountedComponents = [];

    for (const component of this.state.components) {
      const instance = new component(this.state);
      if (instance instanceof Router) {
        this.state.router = instance;
        instance.addRoutings(this.routings);
        instance.navigate('');
      }

      this.state.mountedComponents.push(instance);
    }
  }

  public traverseElementAndExecuteDirectives(element: HTMLElement) {
    if (!element) {
      return;
    }
    if (element.childNodes.length > 0) {
      for (const child of element.childNodes) {
        this.traverseElementAndExecuteDirectives(child as HTMLElement);
      }
    }

    this.engine.executeDirectivesOnElement(element, true);
  }

  public getInstanceOfElementOrNull(element: HTMLElement): any {
    while (element.parentElement != null) {
      if (this.engine.elementCanGetAttribute(element)) {
        if (element.hasAttribute('element-guid')) {
          return this.getInstanceFromInstanceId(element.getAttribute('element-guid'));
        }
      }
      element = element.parentElement;
    }
    return null;
  }
  public setInstanceIdOnElement(element: HTMLElement, component: IComponent): any {
    const guid = Guid.newGuid();
    element.setAttribute('element-guid', guid);
    this.state.instances.push(new Instance(guid, component, element));
    return guid;
  }

  public getInstanceFromInstanceId(instanceId: string): any {
    const foundInstances = this.state.instances.filter((instance: Instance) => {
      if (instance.getIdentifier() === instanceId) {
        return instance;
      }
    });
    if (foundInstances.length === 0) {
      return null;
    }
    return foundInstances.pop();
  }

  public getElementAttributesByInstanceId(instanceId: string): NamedNodeMap {
    const foundInstances = this.state.instances.filter((instance: Instance) => {
      if (instance.getIdentifier() === instanceId) {
        return instance;
      }
    });
    if (foundInstances.length === 0) {
      return null;
    }
    return foundInstances.pop().getElement().attributes;
  }

  public getElementAttributesByInstance(component: IComponent): NamedNodeMap {
    const foundInstances = this.state.instances.filter((instance: Instance) => {
      if (instance.getComponent() === component) {
        return instance;
      }
    });
    if (foundInstances.length === 0) {
      return null;
    }
    return foundInstances.pop().getElement().attributes;
  }

  public setComponentVariables(element: HTMLElement) {
    const elementAttributes = element.attributes as NamedNodeMap;

    const instance = this.getInstanceOfElementOrNull(element);
    if (instance === null) {
      // tslint:disable: no-console
      return;
    }
    for (const attribute of elementAttributes) {
      if (typeof instance.getComponent()[attribute.name] !== 'undefined') {
        instance.getComponent()[attribute.name] = attribute.value;
      }
    }
  }

  public renderNContent(nContentElement: HTMLElement, content: HTMLElement) {
    console.warn('rendering n-content element');
    console.warn(nContentElement);
    console.warn(content);
    if (nContentElement.hasAttribute('select')) {
      for (const child of content.children) {
        if (child.tagName === nContentElement.getAttribute('select')) {
          nContentElement.innerHTML = child.innerHTML;
          return;
        }
      }
    }
    nContentElement.innerHTML = content.innerHTML;
  }

  public generateTempElement(innerHTML: string) {
    const element = document.createElement('n-template');
    element.innerHTML = innerHTML;
    return element;
  }

  public restoreComponentElement(element: HTMLElement) {
    const nContents = element.querySelectorAll('n-content');
    let html = '';
    for (const content of nContents) {
      html += content.innerHTML;
    }
    element.innerHTML = html;
  }
  public elementHasGuidSet(element: HTMLElement) {
    return element.hasAttribute('element-guid');
  }
  public findComponentInMountedComponentsByTagName(tagName: string) {
    tagName = tagName.toUpperCase();
    const component = this.state.mountedComponents.find((i: IComponent) => i.selector === tagName.toLowerCase());
    if (typeof component === 'undefined') {
      return null;
    }
    return component;
  }
  // tslint:disable-next-line:member-ordering
  public renderComponents(exclude?: HTMLElement) {
    this.injectComponents();
    // tslint:disable-next-line:max-line-length
    for (const component of this.state.mountedComponents) {
      const elements = document.getElementsByTagName(component.selector);
      if (elements.length === 0) {
        continue;
      }
      for (const element of elements) {
        this.renderElement(element);
      }
    }
    for (const component of this.state.mountedComponents) {
      const elements = document.getElementsByTagName(component.selector);
      if (elements.length === 0) {
        continue;
      }
      for (const element of elements) {
        if (element.childNodes.length > 0) {
          if (element === exclude) {
            continue;
          }

          if (this.shallRenderElement(element)) {
            this.traverseElementAndExecuteDirectives(element);
            this.engine.executeInterpolationsOnElement(element);
            this.renderedElements.push(element);
            this.setComponentVariables(element);
          }
        }
      }
    }
    this.renderedElements = [];
  }

  public recreateComponentsByName(name: string) {
    if (typeof this.state.mountedComponents !== 'undefined' && this.state.mountedComponents !== null) {
      let component = null;
      for (const c of this.state.mountedComponents) {
        if (c.selector === name) {
          component = c;
        }
      }
      if (component === null) {
        return;
      }
      if (this.state.mountedComponents[name] === null) {
        return;
      }

      const elements = document.getElementsByTagName(name);
      for (const element of elements) {
        this.restoreComponentElement(element as HTMLElement);
        const componentHTML = component.render();
        if (componentHTML.includes('<' + component.selector + '>')) {
          console.error('component ' + component.selector + ' has a recursion with no exit condition');
          continue;
        }
        element.innerHTML = componentHTML;
        this.renderComponents(element as HTMLElement);
      }
    }
  }

  public recreateAllComponents() {
    this.renderComponents();
  }

  private renderElement(element: HTMLElement) {
    if (this.elementHasGuidSet(element)) {
      return;
    }
    const mountedComponents = this.state.mountedComponents as IComponent[];
    const selectors = [];
    for (const c of mountedComponents) {
      selectors.push(c.selector);
    }
    // tslint:disable-next-line:max-line-length
    const component = this.findComponentInMountedComponentsByTagName(element.tagName) as IComponent;
    if (component === null) {
      return;
    }
    const componentElement = this.generateTempElement(component.render());

    const contentList = componentElement.querySelectorAll('n-content');
    const innerHTML = this.generateTempElement(element.innerHTML);
    if (contentList.length > 0) {
      for (const node of contentList) {
        this.renderNContent(node as HTMLElement, innerHTML);
      }
    }
    element.innerHTML = componentElement.innerHTML;
    this.setInstanceIdOnElement(element, component);
    for (const child of element.children) {
      this.renderElement(child as HTMLElement);
    }
  }

  private getAllDescendantsForElementWithTagName(element: HTMLElement, tagName: string): NodeListOf<HTMLElement> {
    return element.querySelectorAll(tagName);
  }

  private shallRenderElement(element: HTMLElement): boolean {
    // Don't forget to clear this array as it may messes with the DOM.
    for (const parent of this.renderedElements) {
      if (this.engine.isDescendant(parent, element)) {
        return false;
      }
    }
    return true;
  }
}
