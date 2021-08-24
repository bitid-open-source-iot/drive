import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: 'files',
        loadChildren: () => import('./pages/files/files.module').then(m => m.FilesPageModule)
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
