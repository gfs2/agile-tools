import { Attribute, Component } from '@at/webcomponents';
import template from './at-calendar-months.template.html';

export interface Months {
    index: number,
}

@Component('at-calendar-months', template)
export class AtCalendarMonths extends HTMLElement {
    @Attribute()
    data: Months[];
    
    constructor() {
      super();
      this.data = [];
    }

}