import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Users } from '../model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private dbPath = '/users';

  usersRef: AngularFirestoreCollection<Users> = null;
  public dbUser: AngularFirestore;

  constructor(private db: AngularFirestore) {
    this.usersRef = db.collection(this.dbPath);
    this.dbUser = db;
  }

  getAll(): AngularFirestoreCollection<Users> {
    return this.usersRef;
  }

  create(user: Users): any {
    return this.usersRef.add({ ...user });
  }

  update(key: string, value: any): Promise<void> {
    return this.usersRef.doc(key).update(value);
  }

  delete(key: string): Promise<void> {
    return this.usersRef.doc(key).delete();
  }

  queryUser(column: string, value: string, test: any = '==') : any {
    return this.usersRef.ref.where(column, test, value);
  }
}
