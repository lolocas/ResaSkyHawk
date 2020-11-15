import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Event } from '../model';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private dbPath = '/event';

  EventRef: AngularFirestoreCollection<Event> = null;
  public dbEvent: AngularFirestore;

  constructor(private db: AngularFirestore) {
    this.EventRef = db.collection<Event>(this.dbPath);
    this.dbEvent = db;
  }

  getAll(): AngularFirestoreCollection<Event> {
    return this.EventRef;
  }

  create(event: Event): any {
    return this.EventRef.add({ ...event });
  }

  update(key: string, value: any): Promise<void> {
    return this.EventRef.doc(key).update(value);
  }

  delete(key: string): Promise<void> {
    return this.EventRef.doc(key).delete();
  }
}
