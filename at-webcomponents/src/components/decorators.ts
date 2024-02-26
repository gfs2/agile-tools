import 'reflect-metadata';
import { parseAttribute } from '../utils/attribute.parser';

type TagsNames = keyof HTMLElementTagNameMap;
const propEventsSymbol = Symbol('eventProperties');
const observedAttributesMetadata = Symbol('observedAttributesSymbol');
const isMountedSymbol = Symbol('isMountedSymbol');

type EventMap = {
    eventName: keyof HTMLElementEventMap,
    handlerProp: string | symbol,
};

function ComponentDeco(
  cName: string,
  extendsTag?: TagsNames,
  template?: string
): ClassDecorator {

  console.debug("calling decorator definition for ", cName, extendsTag, template);

  function classDeco(target: any) {
    console.debug("calling decorator instance for target", target, cName, extendsTag, template);

    const CustomComponent = class extends target {
      static get observedAttributes() {
        return Reflect.getMetadata(observedAttributesMetadata, this) ?? [];
      }
      connectedCallback() {
        this[isMountedSymbol as any] = true;
        super[propEventsSymbol]?.forEach((event: EventMap) => {
          this.addEventListener(event.eventName, super[event.handlerProp]);
        });
        super.connectedCallback?.();
        const undefinedElements: NodeListOf<HTMLElement> =
          this.querySelectorAll(':not(:defined)');
        const promises = Array.from(undefinedElements).map((element) => {
          return customElements.whenDefined(element.localName);
        });
        Promise.all(promises).then(() => {
          if (this[isMountedSymbol as any]) {
            super.childrenReady?.();
          }
        });
      }
      disconnectedCallback() {
        super[isMountedSymbol] = false;
        super[propEventsSymbol]?.forEach((event: EventMap) => {
          this.removeEventListener(event.eventName, super[event.handlerProp]);
        });
        super.connectedCallback?.();
      }
      attributeChangedCallback(
        propName: string,
        old: any,
        newValue: any,
        last: any
      ) {
        let type = Reflect.getMetadata('design:type', this, propName);
        if (type == null) {
          throw new Error(`can not find the type for property <${propName}> in ${this.name}`)
        }
        this[propName] = parseAttribute(newValue, type.name);
        super.attributeChangedCallback?.(propName, old, newValue, last);
      }
      constructor(...args: any[]) {
        super(...args);
        if (template) {
          const shadowRoot = this.attachShadow({
            mode: 'open',
          });
          const templateFR = document.createElement('div');
          templateFR.innerHTML = template;
          const templateEl = templateFR.querySelector(
            'template'
          ) as HTMLTemplateElement;
          shadowRoot.appendChild(templateEl.content.cloneNode(true));
        }
      }
    };

    console.log("define ", cName)

    customElements.define(
      cName,
      CustomComponent as any,
      extendsTag ? { extends: extendsTag } : undefined
    );
  }
  return classDeco;
}

export function Enhancer(name: string, extendsTag?: TagsNames): ClassDecorator {
  return ComponentDeco(name, extendsTag);
}
export function Component(name: string, template?: string): ClassDecorator {
  return ComponentDeco(name, undefined, template);
}

export function On<K extends keyof HTMLElementEventMap>(
  eventName: K
): MethodDecorator {
  return (target, propertyKey) => {
    const obj = target as { [propEventsSymbol]: EventMap[] };
    obj[propEventsSymbol] = obj[propEventsSymbol] ?? [];
    obj[propEventsSymbol].push({
      eventName,
      handlerProp: propertyKey,
    });
  };
}

export function Attribute(): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const oldObserved =
      Reflect.getMetadata(observedAttributesMetadata, target.constructor) ?? [];
    oldObserved.push(propertyKey);
    Reflect.defineMetadata(
      observedAttributesMetadata,
      oldObserved,
      target.constructor
    );
  };
}

export function Child(selector: string, real?: boolean): PropertyDecorator {
  return (
    target: any,
    propertyKey: string | symbol
  ) => {
    const tcp = target.constructor.prototype;
    Object.defineProperty(tcp, propertyKey, {
      enumerable: true,
      get: function () {
        const el = real
          ? (this as HTMLElement)
          : (this as HTMLElement).shadowRoot;
        return el?.querySelector(selector);
      },
    });
  };
}

export function Children(selector: string): PropertyDecorator {
  return (
    target: any,
    propertyKey: string | symbol
  ) => {
    const tcp = target.constructor.prototype;
    Object.defineProperty(tcp, propertyKey, {
      enumerable: true,
      get: function () {
        return (this as HTMLElement).querySelectorAll(selector);
      },
    });
  };
}
