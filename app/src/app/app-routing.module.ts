/* --- MODULES --- */
import { NgModule } from '@angular/core';
import { AuthManager } from './services/auth/auth.service';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: 'home',
        loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
    },
    {
        path: 'files',
        canActivate: [AuthManager],
        loadChildren: () => import('./pages/files/files.module').then(m => m.FilesPageModule)
    },
    {
        path: 'subscribers',
        canActivate: [AuthManager],
        loadChildren: () => import('./pages/subscribers/subscribers.module').then(m => m.SubscribersPageModule)
    },
    {
        path: 'authenticate',
        loadChildren: () => import('./pages/authenticate/authenticate.module').then(m => m.AuthenticatePageModule)
    },
    {
        path: '**',
        redirectTo: 'files'
    }
];

@NgModule({
    exports: [RouterModule],
    imports: [RouterModule.forRoot(routes)],
})

export class AppRoutingModule { }
