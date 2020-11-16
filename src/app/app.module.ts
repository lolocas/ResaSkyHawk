import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { ContextMenuModule } from 'ngx-contextmenu';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UsersComponent } from './users/users.component';

import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFirestoreModule } from '@angular/fire/firestore';

import { environment } from '../environments/environment';
import { PlanesComponent } from './planes/planes.component';
import { EventsComponent } from './events/events.component';

//import 'flatpickr/dist/flatpickr.css'; => Dans index.html
import { FlatpickrModule } from 'angularx-flatpickr';
import flatpickr from 'flatpickr';
import { French } from 'flatpickr/dist/l10n/fr';

import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

@NgModule({
  declarations: [
    AppComponent,
    UsersComponent,
    PlanesComponent,
    EventsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
    ContextMenuModule.forRoot({ useBootstrap4: true }),
    FlatpickrModule.forRoot(),
    NgbModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule, // for firestore
    AngularFireDatabaseModule,
    NgxMaterialTimepickerModule
  ],
  providers: [AppComponent,
    { provide: LOCALE_ID, useValue: "fr-fr" }],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function flatpickrFactory() {
  flatpickr.localize(French);
  return flatpickr;
}
