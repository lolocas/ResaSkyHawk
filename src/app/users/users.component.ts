import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { UsersService } from './users.service';
import { Users } from '../model';
import { map } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  public listeUsers: any;
  public editMode: boolean = false;
  public createMode: boolean = false;
  public currentUser: Users = null;
  public cloneUser: Users = null;

  @ViewChild('confirmeDelete', { static: true }) confirmeDelete: TemplateRef<any>;

  constructor(private usersService: UsersService, private modal: NgbModal) { }

  ngOnInit(): void {
    this.retrieveUsers();
  }

  public saveUser(): void {
    if (this.createMode) {
      this.usersService.create(this.currentUser).then(() => {
        console.log('Created new user successfully!', this.currentUser);
        this.createMode = false;
      });
    }
    else if (this.editMode) {
      this.usersService.update(this.currentUser.key, this.currentUser).then(() => {
        console.log('Edit user successfully!', this.currentUser);
        this.editMode = false;
        this.currentUser = null;
      });
    }
  }

  public addUser(): void {
    this.createMode = true;
    this.currentUser = new Users();
  }

  public editUser(user: Users): void {
    this.editMode = true;
    this.currentUser = user;
    this.cloneUser = { ...user };
  }

  public deleteUser(user: Users): void {
    this.currentUser = user;
    if (confirm('Voulez-vous supprimer cet utilisateur ?'))
        this.usersService.delete(this.currentUser.key);
  }

  public cancelEdit() {
    if (this.editMode) {
      this.currentUser.nom = this.cloneUser.nom;
      this.currentUser.prenom = this.cloneUser.prenom;
    }
    this.editMode = false;
    this.createMode = false;
  }

  retrieveUsers(): void {
    this.usersService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ key: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.listeUsers = data;
    });
  }
}
