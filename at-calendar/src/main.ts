import { AtCalendarMonths } from './at-calendar-months/at-calendar-months.component';
import './style.css'
import { Child, Component } from "@at/webcomponents";

@Component("at-calendar")
export class AtCalendar extends HTMLElement {

    @Child(AtCalendarMonths.selector)
    months?: AtCalendarMonths;

    constructor() {
        super();
    }

}
