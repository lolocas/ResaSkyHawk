import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { PlaneService } from './planes.service';
import { Plane } from '../model';
import { map } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-planes',
  templateUrl: './planes.component.html',
  styleUrls: ['./planes.component.css']
})
export class PlanesComponent implements OnInit {

  public listePlanes: any;
  public editMode: boolean = false;
  public createMode: boolean = false;
  public currentPlane: Plane = null;
  public clonePlane: Plane = null;

  constructor(private planeService: PlaneService, private modal: NgbModal) { }

  ngOnInit(): void {
    this.retrievePlanes();
  }

  public savePlane(): void {
    if (this.createMode) {
      this.planeService.create(this.currentPlane).then(() => {
        console.log('Created new plane successfully!', this.currentPlane);
        this.createMode = false;
      });
    }
    else if (this.editMode) {
      this.planeService.update(this.currentPlane.key, this.currentPlane).then(() => {
        console.log('Edit plane successfully!', this.currentPlane);
        this.editMode = false;
        this.currentPlane = null;
      });
    }
  }

  public addPlane(): void {
    this.createMode = true;
    this.currentPlane = new Plane();
  }

  public editPlane(plane: Plane): void {
    this.editMode = true;
    this.currentPlane = plane;
    this.clonePlane = { ...plane };
  }

  public deletePlane(plane: Plane): void {
    this.currentPlane = plane;
    if (confirm('Voulez-vous supprimer cet avion ?'))
        this.planeService.delete(this.currentPlane.key);
  }

  public cancelEdit() {
    if (this.editMode) {
      this.currentPlane.nom = this.clonePlane.nom;
    }
    this.editMode = false;
    this.createMode = false;
  }

  retrievePlanes(): void {
    this.planeService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ key: c.payload.key, ...c.payload.val() })
        )
      )
    ).subscribe(data => {
      this.listePlanes = data;
    });
  }
}
