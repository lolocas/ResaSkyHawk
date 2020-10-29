import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
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
  @Input() public eventData: { event: Event, addEvent: boolean };
  refresh: Subject<any> = new Subject();

  @ViewChild('confirmeDelete', { static: true }) confirmeDelete: TemplateRef<any>;


  constructor(private eventService: EventService, public modal: NgbActiveModal) { }

  ngOnInit(): void {
    flatpickrFactory();
  }

  public valider(): void {
    //this.eventData.event.nom = 'TTI';
    this.saveEvent();
    this.modal.close(this.saveEvent);
  }

  private saveEvent(): void {
    if (this.eventData.addEvent) {
      this.eventService.create(this.eventData.event).then(() => {
        console.log('Created new event successfully!', this.eventData.event);
      });
    }
    else {
      this.eventData.event.startDateTime = UtilsHelper.DateToTimestamp(this.eventData.event.startDate);
      this.eventData.event.endDateTime = UtilsHelper.DateToTimestamp(this.eventData.event.endDate);

      this.eventService.update(this.eventData.event.key, this.eventData.event).then(() => {
        console.log('Edit event successfully!', this.eventData.event);
      });
    }
  }
}
