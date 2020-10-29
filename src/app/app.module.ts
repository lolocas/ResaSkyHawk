import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UsersComponent } from './users/users.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { environment } from '../environments/environment';
import { PlanesComponent } from './planes/planes.component';
import { EventsComponent } from './events/events.component';

//import 'flatpickr/dist/flatpickr.css'; => Dans index.html
import { FlatpickrModule } from 'angularx-flatpickr';
import flatpickr from 'flatpickr';
import { French } from 'flatpickr/dist/l10n/fr';

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
    FlatpickrModule.forRoot(),
    NgbModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule
  ],
  providers: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function flatpickrFactory() {
  flatpickr.localize(French);
  return flatpickr;
}
