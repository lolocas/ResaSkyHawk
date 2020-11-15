import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Plane } from '../model';

@Injectable({
  providedIn: 'root'
})
export class PlaneService {

  private dbPath = '/plane';

  PlaneRef: AngularFirestoreCollection<Plane> = null;

  constructor(private db: AngularFirestore) {
    this.PlaneRef = db.collection(this.dbPath);
  }

  getAll(): AngularFirestoreCollection<Plane> {
    return this.PlaneRef;
  }

  create(plane: Plane): any {
    return this.PlaneRef.add({ ...plane });
  }

  update(key: string, value: any): Promise<void> {
    return this.PlaneRef.doc(key).update(value);
  }

  delete(key: string): Promise<void> {
    return this.PlaneRef.doc(key).delete();
  }
}
