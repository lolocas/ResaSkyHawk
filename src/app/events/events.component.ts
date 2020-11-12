import { Component, OnInit, ViewChild, TemplateRef, Input, Output } from '@angular/core';
import { EventService } from './events.service';
import { Event } from '../model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { UtilsHelper } from '../UtilsHelper';
import { flatpickrFactory } from '../app.module';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {
  @Input() @Output() public eventData: { event: Event, addEvent: boolean, showDate: boolean, withHours: boolean };
  public refresh: Subject<any> = new Subject();
  @Input() @Output() public startTime: string = '12:00';
  @Input() @Output() public endTime: string = '13:00';
  @Input() @Output() public dateDay: Date;

  constructor(private eventService: EventService, public modal: NgbActiveModal) { }

  ngOnInit(): void {
    flatpickrFactory();

      this.dateDay = this.eventData.event.startDate;

    if (!this.eventData.addEvent || this.eventData.withHours) {
      this.startTime = this.eventData.event.startDate.getHours() + ':' + this.eventData.event.startDate.getMinutes();
      this.endTime = this.eventData.event.endDate.getHours() + ':' + this.eventData.event.endDate.getMinutes();
    }
  }

  public timeStartChange(event: string) {
    console.log(event);
    var l_lstHours = event.split(':');
    if (l_lstHours[1] != "00" && l_lstHours[1] != "15" && l_lstHours[1] != "30" && l_lstHours[1] != "45") {
      var l_intMinutes = Number(l_lstHours[1]);
      if (l_intMinutes == 1 || l_intMinutes == 29)
        this.startTime = Number(l_lstHours[0]) + ':' + '15';
      else if (l_intMinutes == 16 || l_intMinutes == 44)
        this.startTime = Number(l_lstHours[0]) + ':' + '30';
      else if (l_intMinutes == 14)
        this.startTime = Number(l_lstHours[0]) + ':' + '00';
      else if (l_intMinutes == 31)
        this.startTime = Number(l_lstHours[0]) + ':' + '45';
      else if (l_intMinutes == 46)
        this.startTime = Number(l_lstHours[0]) +1 + ':' + '00';
      else if (l_intMinutes == 59)
        this.startTime = Number(l_lstHours[0]) -1 + ':' + '45';

      event = this.startTime;
      var l_lstHours = event.split(':');
    }

    if (event && Date.parse('01/01/2020 ' + event) >= Date.parse('01/01/2020 ' + this.endTime))
      this.endTime = Number(l_lstHours[0]) + 1 + ':' + '00';
  }

  public timeEndChange(event: string) {
    var l_lstHours = event.split(':');
    if (l_lstHours[1] != "00" && l_lstHours[1] != "15" && l_lstHours[1] != "30" && l_lstHours[1] != "45") {
      var l_intMinutes = Number(l_lstHours[1]);
      if (l_intMinutes == 1 || l_intMinutes == 29)
        this.endTime = Number(l_lstHours[0]) + ':' + '15';
      else if (l_intMinutes == 16 || l_intMinutes == 44)
        this.endTime = Number(l_lstHours[0]) + ':' + '30';
      else if (l_intMinutes == 14)
        this.endTime = Number(l_lstHours[0]) + ':' + '00';
      else if (l_intMinutes == 31)
        this.endTime = Number(l_lstHours[0]) + ':' + '45';
      else if (l_intMinutes == 46)
        this.endTime = Number(l_lstHours[0]) + 1 + ':' + '00';
      else if (l_intMinutes == 59)
        this.endTime = Number(l_lstHours[0]) - 1 + ':' + '45';

      event = this.endTime;
      var l_lstHours = event.split(':');
    }

    if (event && Date.parse('01/01/2020 ' + event) <= Date.parse('01/01/2020 ' + this.startTime))
      this.startTime = Number(l_lstHours[0]) - 1 + ':' + '00';
  }

  public valider(): void {
    //this.eventData.event.nom = 'TTI';
    this.saveEvent();
    this.modal.close(this.saveEvent);
  }

  private saveEvent(): void {
    var l_lstStartHours = this.startTime.split(':');
    var l_lstEndHours = this.endTime.split(':');
    this.eventData.event.startDate = new Date(this.dateDay);
    this.eventData.event.endDate = new Date(this.dateDay);
    this.eventData.event.startDate.setHours(Number(l_lstStartHours[0]), Number(l_lstStartHours[1]));
    this.eventData.event.endDate.setHours(Number(l_lstEndHours[0]), Number(l_lstEndHours[1]));
    this.eventData.event.startDateTime = UtilsHelper.DateToTimestamp(this.eventData.event.startDate);
    this.eventData.event.endDateTime = UtilsHelper.DateToTimestamp(this.eventData.event.endDate);

    if (this.eventData.addEvent) {
      this.eventService.create(this.eventData.event).then(() => {
        console.log('Created new event successfully!', this.eventData.event);
      });
    }
    else {
      this.eventService.update(this.eventData.event.key, this.eventData.event).then(() => {
        console.log('Edit event successfully!', this.eventData.event);
      });
    }
  }
}
