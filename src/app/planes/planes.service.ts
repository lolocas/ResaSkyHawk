import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Plane } from '../model';

@Injectable({
  providedIn: 'root'
})
export class PlaneService {

  private dbPath = '/plane';

  PlaneRef: AngularFireList<Plane> = null;

  constructor(private db: AngularFireDatabase) {
    this.PlaneRef = db.list(this.dbPath);
  }

  getAll(): AngularFireList<Plane> {
    return this.PlaneRef;
  }

  create(plane: Plane): any {
    return this.PlaneRef.push(plane);
  }

  update(key: string, value: any): Promise<void> {
    return this.PlaneRef.update(key, value);
  }

  delete(key: string): Promise<void> {
    return this.PlaneRef.remove(key);
  }

  deleteAll(): Promise<void> {
    return this.PlaneRef.remove();
  }
}
