import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminBackendComponent } from './components/admin/admin-backend/admin-backend.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { MainComponent } from './components/main/main.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import { AdministratorsGroupGuard } from './guards/administrators-group.guard';
import { LoginGuardGuard } from './guards/login-guard.guard';
import { LogoutGuard } from './guards/logout.guard';

const routes: Routes = [
  { path: "login", component: LoginComponent, canActivate: [LogoutGuard]},
  { path: "", component: MainComponent, canActivate: [LoginGuardGuard]},
  { path: "main", component: MainComponent, canActivate: [LoginGuardGuard]},
  { path: "home", component: HomeComponent, canActivate: [LoginGuardGuard]},
  { path: "user_settings", component: UserSettingsComponent, canActivate: [LoginGuardGuard]},
  { path: "administrators/dashboard", component: AdminBackendComponent, canActivate: [AdministratorsGroupGuard]},
  { path: "**", component: PageNotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
