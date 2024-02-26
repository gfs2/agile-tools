import { Attribute, Children, Component, reconciliateCollection } from '@at/webcomponents';
import template from './at-calendar-months.template.html?raw';
import { AtCalendarMonth, Month } from '../at-calendar-month/at-calendar-month.component';

@Component(AtCalendarMonths.selector, template)
export class AtCalendarMonths extends HTMLElement {
  static selector = 'at-calendar-months';
  
  connectedCallback() {
    console.log("AT CALENDAR MONTH")
  }

  @Attribute()
  data?: Month[];

  @Children(AtCalendarMonth.selector)
  items?: NodeListOf<AtCalendarMonth>;

  constructor() {
    super();
  }

  childrenReady() {
    this.data = mapElementToData(this.items, (item) => {
      const index = parseInt(item.getAttribute("index") ?? "0");
      const itemData: Month = {
        index,
      };
      return itemData;
    });
    this.update();
  }

  update() {
    reconciliateCollection(
      this.data,
      () => this.items,
      'index',
      'index',
      AtCalendarMonth.mapMe,
      AtCalendarMonth.createMe,
      this
    );

/*
    // get actually exisisting elements
    const existingElements = (this.data ?? [])
      .map((item) => AtCalendarMonth.findByIndex(this, item.index))
      .filter((el) => el != null);
    // remove lost elements
    this.items?.forEach((el) =>
      existingElements.includes(el) ? null : el.remove()
    );
    // add or move
    this.data?.forEach((item, index) => {
      let elementIndex = existingElements.findIndex(
        (el) => el?.index === item.index
      );
      const created = elementIndex < 0;
      let element = existingElements.at(elementIndex);
      if (created || !element) {
        element = AtCalendarMonth.createMe();
      }
      // check if reoder is needed
      const prevItem = this.items?.[index - 1];
      if (index === 0 || !prevItem) this.prepend(element);
      else prevItem.insertAdjacentElement('afterend', element);

      element.index = item.index;

      // update element
      element.update();
    });    

    */

    this.items?.forEach(el => el.update());
  }

}

function mapElementToData<TDataItem, TElement extends HTMLElement>(
  items: NodeListOf<TElement> | undefined,
  mapper: (item: TElement) => TDataItem
) {
  const arr: TDataItem[] = [];
  if (!items) return arr;
  items.forEach(el => {
    const item = mapper(el);
    arr.push(item);
  })
  return arr;
}

