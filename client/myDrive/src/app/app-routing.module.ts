import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { UserSettingsComponent } from './components/user-settings/user-settings.component';
import { LoginGuardGuard } from './guards/login-guard.guard';

const routes: Routes = [
  { path: "login", component: LoginComponent},
  { path: "", component: HomeComponent, canActivate: [LoginGuardGuard]},
  { path: "home", component: HomeComponent, canActivate: [LoginGuardGuard]},
  { path: "user_settings", component: UserSettingsComponent, canActivate: [LoginGuardGuard]},
  { path: "**", component: PageNotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
