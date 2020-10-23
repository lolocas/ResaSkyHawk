import { Component, OnInit, Input, Output } from '@angular/core';
import { UsersService } from './users.service';
import { Users } from '../model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  listeUsers: any;
  user: Users = new Users();
  public submitted = true;
  
  constructor(private usersService: UsersService) { }

  ngOnInit(): void {
    this.retrieveUsers();
  }

  saveUser(): void {
      this.submitted = true;
    this.usersService.create(this.user).then(() => {
      console.log('Created new user successfully!');
    });
  }

  newUser(): void {
    this.submitted = false;
    this.user = new Users();
  }

  retrieveUsers(): void {
    this.usersService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ key: c.payload.key, ...c.payload.val() })
        )
      )
    ).subscribe(data => {
      this.listeUsers = data;
    });
  }

}
