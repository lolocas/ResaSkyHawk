import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
  OnInit,
} from '@angular/core';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isSameMonth,
  addHours,
  format
} from 'date-fns';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarDateFormatter,
  CalendarView,
  DAYS_OF_WEEK
} from 'angular-calendar';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr'; // to register french
import { CustomDateFormatter } from './custom-date-formatter.provider';
import { Event } from './model';
import { EventsComponent } from './events/events.component';
import './UtilsHelper';
import { EventService } from './events/events.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { firestore } from 'firebase/app';
import Timestamp = firestore.Timestamp;

registerLocaleData(localeFr);

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};


interface Film {
  id: number;
  title: string;
  release_date: string;
}




@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter
    }
  ]
})

export class AppComponent implements OnInit {

  constructor(private modal: NgbModal, private eventService: EventService) { }

  //events: CalendarEvent[] = [];
  //events$: Observable<CalendarEvent<{ event: Film }>[]>;

  events$: Observable<CalendarEvent<{ event: Event }>[]>;

  public ngOnInit() {

    this.eventService.getEvents();


    this.events$ = this.eventService.items$
      .pipe(
        map(actions => {
          return actions.map((event: Event) => {
            return {
              title: event.nom,
              start: new Date(event.startDateTime.seconds * 1000),
              color: colors.yellow,
              allDay: true,
            };
          });
        })
      );
  }


  @ViewChild('modalEvent', { static: true }) modalEvent: TemplateRef<any>;
  @ViewChild('modalAdmin', { static: true }) modalAdmin: TemplateRef<any>;

  view: CalendarView = CalendarView.Month;

  locale: string = 'fr';

  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;

  weekendDays: number[] = [DAYS_OF_WEEK.SATURDAY, DAYS_OF_WEEK.SUNDAY];

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  private m_blnAddEvent: boolean = false;

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-fw fa-pencil-alt"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      },
    },
    {
      label: '<i class="fas fa-fw fa-trash-alt"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
////////this.events = this.events.filter((iEvent) => iEvent !== event);
        this.handleEvent('Deleted', event);
      },
    },
  ];

  refresh: Subject<any> = new Subject();

  //events : CalendarEvent[]=
  //  [
  //  {
  //    start: subDays(startOfDay(new Date()), 1),
  //    end: addDays(new Date(), 1),
  //    title: 'A 3 day event',
  //    color: colors.red,
  //    actions: this.actions,
  //    allDay: true,
  //    resizable: {
  //      beforeStart: true,
  //      afterEnd: true,
  //    },
  //    draggable: true,
  //  },
  //  {
  //    start: startOfDay(new Date()),
  //    title: 'An event with no end date',
  //    color: colors.yellow,
  //    actions: this.actions,
  //  },
  //  {
  //    start: subDays(endOfMonth(new Date()), 3),
  //    end: addDays(endOfMonth(new Date()), 3),
  //    title: 'A long event that spans 2 months',
  //    color: colors.blue,
  //    allDay: true,
  //  },
  //  {
  //    start: addHours(startOfDay(new Date()), 2),
  //    end: addHours(new Date(), 2),
  //    title: 'A draggable and resizable event',
  //    color: colors.yellow,
  //    actions: this.actions,
  //    resizable: {
  //      beforeStart: true,
  //      afterEnd: true,
  //    },
  //    draggable: true,
  //  },
  //];

  activeDayIsOpen: boolean = true;

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (this.m_blnAddEvent) {
      var l_objEvent: Event = new Event();
      var eventDate: Date = new Date(date);
      l_objEvent.startDate = eventDate.addHours(12);

      const modalRef = this.modal.open(EventsComponent, { size: 'sm' });
      modalRef.componentInstance.eventData = { event: l_objEvent, addEvent: true };
      modalRef.result.then((result) => {
        if (result) {
          console.log(result);
        }
      });

    }
    else if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
    this.m_blnAddEvent = false;
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    /*this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });*/
    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    this.modal.open(this.modalEvent, { size: 'lg' });
  }

  deleteEvent(eventToDelete: CalendarEvent) {
  /////////  this.events = this.events.filter((event) => event !== eventToDelete);
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  public openAdmin() {
    this.modal.open(this.modalAdmin, { size: 'xl' });
  }

  public addEvent() {
    this.m_blnAddEvent = true;
  }
}
