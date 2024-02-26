import { Attribute, Child, Component } from "@at/webcomponents";
import template from "./at-calendar-month.template.html?raw";

export interface Month {
    index: number,
}

@Component(AtCalendarMonth.selector, template)
export class AtCalendarMonth extends HTMLElement {
    static selector = "at-calendar-month" as const;
    static createMe() {
        const element = document.createElement(`at-calendar-month`) as AtCalendarMonth;
        return element;
    }

    static mapMe(item: { index: number }, element: AtCalendarMonth) {
        element.index = item.index;
        element.update();
    }

    static findByIndex(parent: HTMLElement, index: number | string) {
        return parent.querySelector(
            `app-todoitem[index="${index}"]`
        ) as AtCalendarMonth | null;
    }

    @Attribute()
    index?: number;

    @Child(`.month-name`)
    monthName?: HTMLDivElement;

    constructor() {
        super();
    }

    update() {
        if (this.monthName) this.monthName.innerHTML = getMonthName(this.index ?? 0)
    }
}

function getMonthName(index: number): string {
  return new Date(2000, index, 0).toLocaleString(undefined, { month: "long" });
}
