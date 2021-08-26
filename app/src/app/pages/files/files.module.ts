/* --- PAGES --- */
import { FilesPage } from './files.page';
import { FilesViewerPage } from './viewer/viewer.page';
import { FilesEditorPage } from './editor/editor.page';

/* --- MODULES --- */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchModule } from 'src/app/libs/search/search.module';
import { MatListModule } from '@angular/material/list';
import { OptionsModule } from 'src/app/libs/options/options.module';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatContentModule } from 'src/app/libs/mat-content/mat-content.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatBackButtonModule } from 'src/app/libs/mat-back-button/mat-back-button.module';
import { MatMenuButtonModule } from 'src/app/libs/mat-menu-button/mat-menu-button.module';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


const routes: Routes = [
	{
		path: '',
		component: FilesPage
	},
	{
		path: 'viewer',
		component: FilesViewerPage
	},
	{
		path: 'editor',
		component: FilesEditorPage
	}
];

@NgModule({
	imports: [
		FormsModule,
		CommonModule,
		SearchModule,
		MatListModule,
		MatIconModule,
		OptionsModule,
		MatTableModule,
		MatButtonModule,
		MatContentModule,
		MatSidenavModule,
		MatToolbarModule,
		MatFormFieldModule,
		ReactiveFormsModule,
		MatMenuButtonModule,
		MatBackButtonModule,
		RouterModule.forChild(routes)
	],
	declarations: [
		FilesPage,
		FilesViewerPage,
  		FilesEditorPage
	]
})

export class FilesPageModule { }
