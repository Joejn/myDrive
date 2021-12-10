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

import { TokenInterceptorService } from './services/token-interceptor.service';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTreeModule } from '@angular/material/tree';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatListModule } from '@angular/material/list';

import { DragDropModule } from '@angular/cdk/drag-drop';

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
import { TrashComponent } from './components/trash/trash.component';
import { ConfirmUserDeleteComponent } from './components/admin/dialogs/confirm-user-delete/confirm-user-delete.component';
import { RenameComponent } from './dialogs/rename/rename.component';
import { ForbiddenFilenameDirective } from './shared/forbidden-filename.directive';
import { RecentComponent } from './components/recent/recent.component';
import { FileTableComponent } from './components/shares/file-table/file-table.component';
import { SharedWithMeComponent } from './components/shared-with-me/shared-with-me.component';
import { AddToGroupComponent } from './components/admin/dialogs/add-to-group/add-to-group.component';
import { EditGroupsFromUserComponent } from './components/admin/dialogs/edit-groups-from-user/edit-groups-from-user.component';
import { QuotasComponent } from './components/admin/quotas/quotas.component';
import { CreateQuotaComponent } from './components/admin/dialogs/create-quota/create-quota.component';
import { GroupsComponent } from './components/admin/groups/groups.component';
import { AddGroupComponent } from './components/admin/dialogs/add-group/add-group.component';
import { DeleteGroupComponent } from './components/admin/dialogs/delete-group/delete-group.component';

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
  MatPaginatorModule,
  MatCheckboxModule,
  MatDividerModule,
  MatSlideToggleModule,
  MatProgressSpinnerModule,
  MatAutocompleteModule,
  MatListModule
]

const matCdk = [
  DragDropModule
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
    MainComponent,
    TrashComponent,
    ConfirmUserDeleteComponent,
    RenameComponent,
    ForbiddenFilenameDirective,
    RecentComponent,
    FileTableComponent,
    SharedWithMeComponent,
    AddToGroupComponent,
    EditGroupsFromUserComponent,
    QuotasComponent,
    CreateQuotaComponent,
    GroupsComponent,
    AddGroupComponent,
    DeleteGroupComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    materialModules,
    matCdk,
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
