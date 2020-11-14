import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
  OnInit,
  APP_BOOTSTRAP_LISTENER,
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
import { Event, Users, Plane } from './model';
import { EventsComponent } from './events/events.component';
import { EventService } from './events/events.service';
import { map, switchMap } from 'rxjs/operators';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { UsersService } from './users/users.service';
import { PlaneService } from './planes/planes.service';
import { UtilsHelper } from './UtilsHelper';
import { Router, ActivatedRoute, Params } from '@angular/router';

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

  constructor(private modal: NgbModal, private eventService: EventService, private usersService: UsersService, private planeService: PlaneService,
    private activatedRoute: ActivatedRoute, private router: Router) { }

  public events$: Observable<CalendarEvent<{ event: Event }>[]>;
  private listeUsers: any;
  public listePlanes: Array<Plane> = [];
  private listeEvents: Array<Event> = [];
  public selectedPlane: Plane = null;
  public isConnected: boolean = false;
  public currentUser: Users;
  public submitted: boolean = false;
  public identifiant: string = "";
  public password: string = "";
  public planeKey: string = "";

  @ViewChild('modalEvent', { static: true }) modalEvent: TemplateRef<any>;
  @ViewChild('modalAdmin', { static: true }) modalAdmin: TemplateRef<any>;

  view: CalendarView = CalendarView.Month;

  locale: string = 'fr';

  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.SATURDAY, DAYS_OF_WEEK.SUNDAY];
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  activeDayIsOpen: boolean = true;
  private m_blnAddEvent: boolean = false;
  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<img src="../assets/edit.png"></img>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.editEvent(event);
      },
    },
    {
      label: '<img src="../assets/delete.png"></img>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        ////////this.events = this.events.filter((iEvent) => iEvent !== event);
        this.deleteEvent(event);
      },
    },
  ];

  refresh: Subject<any> = new Subject();
  planeFilter$: BehaviorSubject<string | null>;
  //colorFilter$: BehaviorSubject<string | null>;

  public ngOnInit() {
    this.planeFilter$ = new BehaviorSubject(null);
   // this.colorFilter$ = new BehaviorSubject(null);

    this.usersService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ key: c.key, ...c.payload.val() })
        )
      )
    ).subscribe(data => {
      this.listeUsers = data;
    });

    this.planeService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ key: c.key, ...c.payload.val() })
        )
      )
    ).subscribe(data => {
      this.listePlanes = data;
      if (this.listePlanes && this.listePlanes.length > 0)
        this.selectedPlane = this.listePlanes[0];
    });

    this.events$ = combineLatest(
      this.planeFilter$,
      //this.colorFilter$
    ).pipe(switchMap(([keyPlane/*, color*/]) =>
      this.eventService.dbEvent.collection<Event>('/event', ref => {
        let query: firebase.firestore.Query = ref;
        query = query.orderBy('startDateTime');
        if (keyPlane)
          query = query.where('keyPlane', '==', keyPlane);
        //else
        //  query = query.where('keyPlane', '==', '-MKd60QJE6kfCTfqUWLV');
        //if (color)
        //  query = query.where('color', '==', color);
        return query;
      }).snapshotChanges().pipe(
        map(events => {
          return events.map(eventP => {
            const data = eventP.payload.doc.data();
            const key = eventP.payload.doc.id;
            var event: Event = { key, ...data };
            this.listeEvents.push(event);
            var startDate = UtilsHelper.TimestampToDate(event.startDateTime);
            var endDate = UtilsHelper.TimestampToDate(event.endDateTime);

            return {
              event: event,
              id: event.key,
              title: event.nom + ' de ' + startDate.getHours() + ':' + String(startDate.getMinutes()).padStart(2, "0") + ' à ' + endDate.getHours() + ':' + String(endDate.getMinutes()).padStart(2, "0"),
              start: new Date(event.startDateTime.seconds * 1000),
              end: new Date(event.endDateTime.seconds * 1000),
              color: colors.blue,
              actions: this.actions,
            };
          });
        }))
    ));


    //this.events$ = this.eventService.getAll().snapshotChanges()
    //  .pipe(
    //    map(events => {
    //      return events.map(eventP => {
    //        const data = eventP.payload.doc.data();
    //        const key = eventP.payload.doc.id;
    //        var event: Event = { key, ...data };
    //        this.listeEvents.push(event);
    //        var startDate = UtilsHelper.TimestampToDate(event.startDateTime);
    //        var endDate = UtilsHelper.TimestampToDate(event.endDateTime);

    //        return {
    //          event: event,
    //          id: event.key,
    //          title: event.nom + ' de ' + startDate.getHours() + ':' + String(startDate.getMinutes()).padStart(2, "0") + ' à ' + endDate.getHours() + ':' + String(endDate.getMinutes()).padStart(2, "0"),
    //          start: new Date(event.startDateTime.seconds * 1000),
    //          end: new Date(event.endDateTime.seconds * 1000),
    //          color: colors.blue,
    //          actions: this.actions,
    //        };
    //      });
    //    })
    //  );
  }



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

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (this.m_blnAddEvent) {
      this.openEvent(date);
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

  //deleteEvent(eventToDelete: CalendarEvent) {
  ///////////  this.events = this.events.filter((event) => event !== eventToDelete);
  //}

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

  public openEvent(date?: Date, isWithHours?: boolean) {
    var isShowDate: Boolean = false;
    if (!date) {
      date = new Date();
      isShowDate = true;
    }
    var l_objEvent: Event = new Event();
    l_objEvent.startDate = date;
    l_objEvent.endDate = date;
    l_objEvent.keyPlane = this.selectedPlane.key;

    if (isWithHours)
      l_objEvent.endDate = addHours(l_objEvent.endDate, 1);

    var l_intUser = Math.floor(Math.random() * this.listeUsers.length);
    l_objEvent.nom = this.listeUsers[l_intUser].nom;
    l_objEvent.keyUser = this.listeUsers[l_intUser].key;

    const modalRef = this.modal.open(EventsComponent);
    modalRef.componentInstance.eventData = { event: l_objEvent, addEvent: true, showDate: isShowDate, withHours: isWithHours };
    modalRef.result.then((result) => {
      if (result) {
        console.log(result);
      }
    });
    this.activeDayIsOpen = true;
    this.viewDate = date;
  }

  private editEvent(eventC: any) {
    var l_objEvent = eventC.event;
    l_objEvent.startDate = UtilsHelper.TimestampToDate(l_objEvent.startDateTime);
    l_objEvent.endDate = UtilsHelper.TimestampToDate(l_objEvent.endDateTime);
    l_objEvent.keyPlane = this.selectedPlane;

    const modalRef = this.modal.open(EventsComponent);
    modalRef.componentInstance.eventData = { event: l_objEvent, addEvent: false };
    modalRef.result.then((result) => {
      if (result) {
        console.log(result);
      }
    });
  }

  private deleteEvent(eventC: CalendarEvent) {
    if (confirm('Voulez-vous supprimer cette réservation ?'))
      this.eventService.delete(eventC.id as string);
  }

  public selectPlane(plane: Plane) {
    this.selectedPlane = plane;
    this.planeFilter$.next(plane.key); 
  }

  public login() {
    this.submitted = true;
    if (!this.identifiant || !this.password || !this.planeKey)
      return;

    var l_intUser = Math.floor(Math.random() * this.listeUsers.length);
    this.currentUser = this.listeUsers[l_intUser];

    this.isConnected = true;
  }

  public logout() {
    this.navigate();
  }

  private navigate() {
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
      }).then(function () {
        window.location.reload();
      })
  }


}
