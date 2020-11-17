import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
  OnInit,
  AfterViewInit
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
import { AngularFireAuth } from "@angular/fire/auth";

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

export class AppComponent implements OnInit, AfterViewInit {

  constructor(private modal: NgbModal, private eventService: EventService, private usersService: UsersService, private planeService: PlaneService,
    private activatedRoute: ActivatedRoute, private router: Router, private afAuth: AngularFireAuth) { }

  public events$: Observable<CalendarEvent<{ event: Event }>[]>;
  public planes$: Observable<Array<Plane>>;
  private listeUsers: Array<Users> = [];
  public listePlanes: Array<Plane> = [];
  private listeEvents: Array<Event> = [];
  public selectedPlane: Plane = new Plane();
  public isConnected: boolean = false;
  public currentUser: Users = new Users();
  public submitted: boolean = false;
  public identifiant: string = "";
  public password: string = "";
  public planeKey: string = "";
  public isAdmin: boolean = false;
  public isMesResa: boolean = false;

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
  userFilter$: BehaviorSubject<string | null>;

  public ngOnInit() {
    this.afAuth.signInAnonymously();

    this.planeFilter$ = new BehaviorSubject(null);
    this.userFilter$ = new BehaviorSubject(null);

    this.usersService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ key: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.listeUsers = data;
    });

    this.planeService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ key: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.listePlanes = data;
      if (this.listePlanes && this.listePlanes.length == 1)
        this.planeKey = this.listePlanes[0].key;
    });

    this.events$ = combineLatest(
      this.planeFilter$,
      this.userFilter$
    ).pipe(switchMap(([keyPlane, keyUser]) =>
      this.eventService.dbEvent.collection<Event>('/event', ref => {
        let query: firebase.firestore.Query = ref;
        query = query.orderBy('startDateTime');
        if (keyPlane)
          query = query.where('keyPlane', '==', keyPlane);
        if (keyUser)
          query = query.where('keyUser', '==', keyUser);
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

            var title:string = startDate.getHours() + ':' + String(startDate.getMinutes()).padStart(2, "0") + ' à ' + endDate.getHours() + ':' + String(endDate.getMinutes()).padStart(2, "0");
            var user: Users = null;
            if (this.listeUsers) {
               user = this.listeUsers.find(item => item.key == event.keyUser);
              if (user)
                title += " " + user.prenom + " " + user.nom;
            }
            if (event.description)
              title += " - " + event.description;

            return {
              event: event,
              id: event.key,
              title: title,
              start: new Date(event.startDateTime.seconds * 1000),
              end: new Date(event.endDateTime.seconds * 1000),
              color: (user && user.couleur) ? { primary: user.couleur, secondary : user.couleur } : null,
              actions: (user && user.key == this.currentUser.key) ? this.actions : null,
            };
          });
        }))
    ));
  }

  public ngAfterViewInit() {
    document.getElementById("txtIdentifiant").focus();
  }

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

  public openMesResa() {
    this.isMesResa = !this.isMesResa;
    if (this.isMesResa)
      this.userFilter$.next(this.currentUser.key);
    else
      this.userFilter$.next("");
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

    l_objEvent.keyUser = this.currentUser.key;

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
    if (!this.identifiant || !this.password || (this.listePlanes.length && !this.planeKey))
      return;

    if (this.listeUsers.length > 0) {
      var user = this.listeUsers.find(item => item.identifiant.toLowerCase() == this.identifiant.toLowerCase() && item.password == this.password);
      if (!user) {
        alert("Identifiant ou mot de passe incorrect");
        return;
      }
      this.currentUser = user;
      if (this.currentUser.identifiant == "Administration")
        this.isAdmin = true;
    }
    else {
      alert("Aucun utilisateur");
      return;
    }

    if (this.listePlanes && this.listePlanes.length > 0) {
      var plane = this.listePlanes.find(item => item.key == this.planeKey);
      if (plane)
        this.selectedPlane = plane;
    }
    else {
      this.selectedPlane.nom = '';
    }

    this.isConnected = true;
  }

  public logout() {
    this.afAuth.signOut();
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
