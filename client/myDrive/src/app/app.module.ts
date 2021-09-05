import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component'
import { ImageFileComponent } from './dialogs/image-file/image-file.component';
import { TextFileComponent } from './dialogs/text-file/text-file.component';

import {TokenInterceptorService } from './services/token-interceptor.service';

import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatTreeModule} from '@angular/material/tree';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {MatDialogModule} from '@angular/material/dialog';
import {MatMenuModule} from '@angular/material/menu';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatPaginatorModule} from '@angular/material/paginator'; 

import { DateAdapter, MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { CustomDateAdapter } from './adapters/custom-date-adapter';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChangePasswordComponent } from './dialogs/change-password/change-password.component';
import { DashboardComponent } from './components/admin/dashboard/dashboard.component';
import { AdminBackendComponent } from './components/admin/admin-backend/admin-backend.component';
import { LineChartCpuUsedComponent } from './components/charts/line-chart-cpu-used/line-chart-cpu-used.component';
import { LineChartMemoryUsedComponent } from './components/charts/line-chart-memory-used/line-chart-memory-used.component';
import { DoughnutChartSpaceUsedComponent } from './components/charts/doughnut-chart-space-used/doughnut-chart-space-used.component';
import { LineChartCpuFreqComponent } from './components/charts/line-chart-cpu-freq/line-chart-cpu-freq.component';
import { UsersComponent } from './components/admin/users/users.component';
import { NewUserDialogComponent } from './components/admin/dialogs/new-user-dialog/new-user-dialog.component';
import { CreateFolderComponent } from './dialogs/create-folder/create-folder.component';
import { MainComponent } from './components/main/main.component';

const materialModules = [
  MatToolbarModule,
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatIconModule,
  MatSidenavModule,
  MatTreeModule,
  MatGridListModule,
  MatTableModule,
  MatSortModule,
  MatDialogModule,
  MatMenuModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatRippleModule,
  MatSnackBarModule,
  MatProgressBarModule,
  MatPaginatorModule
]

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    ImageFileComponent,
    TextFileComponent,
    UserSettingsComponent,
    ChangePasswordComponent,
    DashboardComponent,
    AdminBackendComponent,
    LineChartCpuUsedComponent,
    LineChartMemoryUsedComponent,
    DoughnutChartSpaceUsedComponent,
    LineChartCpuFreqComponent,
    UsersComponent,
    NewUserDialogComponent,
    CreateFolderComponent,
    MainComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    materialModules,
    NgbModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    },
    {
      provide: DateAdapter,
      useClass: CustomDateAdapter
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
