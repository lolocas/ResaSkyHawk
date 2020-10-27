import { firestore } from 'firebase/app';
import * as firebase from 'firebase';
import Timestamp = firestore.Timestamp;

export class Users {
  public key: string;
  public nom: string;
  public prenom: string;
}

export class Plane {
  public key: string;
  public nom: string;
}

export class Event {
  //constructor(t?: Event) {
  //  t.startDate = t.startDateTime.toDate();
  //  Object.assign(this, t);
  //}

  public key: string;
  public nom: string;
  public startDateTime: Timestamp;

  private _startDate: Date;
  get startDate(): Date {
    return this._startDate;
  }
  set startDate(value: Date) {
    this._startDate = value;
    this.startDateTime = firebase.firestore.Timestamp.fromDate(value);
  }

  //private _startDateTime: Timestamp;
  //get startDateTime(): Timestamp {
  //  return this._startDateTime;
  //}
  //set startDateTime(value: Timestamp) {
  //  this._startDateTime = value;
  //  this.startDate = value.toDate();
  //}
}
