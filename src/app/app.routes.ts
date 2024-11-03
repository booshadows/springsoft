import { Routes } from '@angular/router';
import { ProfileEditComponent } from './components/profile-edit/profile-edit.component';
import { ProfileComponent } from './components/profile/profile.component';

export const routes: Routes = [
  { path: '', redirectTo: '/edit-profile/2', pathMatch: 'full' },
  {
    path: 'edit-profile/:id',
    component: ProfileEditComponent,
  },
  {
    path: 'profile/:id',
    component: ProfileComponent,
  },
];
