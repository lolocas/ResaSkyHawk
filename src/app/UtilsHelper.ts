import { firestore } from 'firebase/app';
import Timestamp = firestore.Timestamp;
import * as firebase from 'firebase';

export class UtilsHelper {
  static TimestampToDate(timestamp: Timestamp): Date {
    return new Date(timestamp.seconds * 1000);
  }

  static DateToTimestamp(value: Date): Timestamp {
    return firebase.firestore.Timestamp.fromDate(value);
  }
}


