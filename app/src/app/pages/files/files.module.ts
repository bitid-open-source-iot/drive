/* --- PAGES --- */
import { FilesPage } from './files.page';
import { FilesViewerPage } from './viewer/viewer.page';
import { FilesEditorPage } from './editor/editor.page';

/* --- MODULES --- */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSidenavModule } from '@angular/material/sidenav';

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
		MatIconModule,
		MatButtonModule,
		MatSidenavModule,
		MatToolbarModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		RouterModule.forChild(routes)
	],
	declarations: [
		FilesPage,
		FilesViewerPage,
  		FilesEditorPage
	]
})

export class FilesPageModule { }
