import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Users } from '../model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private dbPath = '/users';

  usersRef: AngularFireList<Users> = null;

  constructor(private db: AngularFireDatabase) {
    this.usersRef = db.list(this.dbPath);
  }

  getAll(): AngularFireList<Users> {
    return this.usersRef;
  }

  create(user: Users): any {
    return this.usersRef.push(user);
  }

  update(key: string, value: any): Promise<void> {
    return this.usersRef.update(key, value);
  }

  delete(key: string): Promise<void> {
    return this.usersRef.remove(key);
  }

  deleteAll(): Promise<void> {
    return this.usersRef.remove();
  }
}
