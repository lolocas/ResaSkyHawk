import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Event } from '../model';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private dbPath = '/event';

  EventRef: AngularFireList<Event> = null;
  items$: Observable<any[]>;

  constructor(private db: AngularFireDatabase) {
    this.EventRef = db.list(this.dbPath);
  }

  getAll(): AngularFireList<Event> {
    return this.EventRef;
  }

  create(event: Event): any {
    return this.EventRef.push(event);
  }

  update(key: string, value: any): Promise<void> {
    return this.EventRef.update(key, value);
  }

  delete(key: string): Promise<void> {
    return this.EventRef.remove(key);
  }

  deleteAll(): Promise<void> {
    return this.EventRef.remove();
  }

  getEvents(): any {
    this.items$ = this.db.list(this.dbPath).snapshotChanges();
  }

}
