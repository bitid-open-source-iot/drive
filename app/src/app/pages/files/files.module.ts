/* --- PAGES --- */
import { FilesPage } from './files.page';
import { FilesViewerPage } from './viewer/viewer.page';
import { FilesEditorPage } from './editor/editor.page';

/* --- MODULES --- */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

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
		CommonModule,
		RouterModule.forChild(routes)
	],
	declarations: [
		FilesPage,
		FilesViewerPage,
  		FilesEditorPage
	]
})

export class FilesPageModule { }
