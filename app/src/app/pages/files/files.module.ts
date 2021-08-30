/* --- PAGES --- */
import { FilesPage } from './files.page';
import { FilesViewerPage } from './viewer/viewer.page';
import { FilesEditorPage } from './editor/editor.page';
import { FilterComponent } from './filter/filter.component';

/* --- MODULES --- */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchModule } from 'src/app/libs/search/search.module';
import { MatListModule } from '@angular/material/list';
import { MatSortModule } from '@angular/material/sort';
import { OptionsModule } from 'src/app/libs/options/options.module';
import { ConfirmModule } from 'src/app/libs/confirm/confirm.module';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { DescribeModule } from 'src/app/pipes/describe/describe.module';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TotalPipeModule } from 'src/app/pipes/total/total.module';
import { MatFooterModule } from 'src/app/libs/mat-footer/mat-footer.module';
import { MatDialogModule }  from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatContentModule } from 'src/app/libs/mat-content/mat-content.module';
import { FileSizePipeModule } from 'src/app/pipes/file-size/file-size.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatBackButtonModule } from 'src/app/libs/mat-back-button/mat-back-button.module';
import { MatMenuButtonModule } from 'src/app/libs/mat-menu-button/mat-menu-button.module';
import { Routes, RouterModule } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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
		MatSortModule,
		MatIconModule,
		ConfirmModule,
		OptionsModule,
		DescribeModule,
		MatTableModule,
		MatInputModule,
		MatDialogModule,
		MatFooterModule,
		MatButtonModule,
		TotalPipeModule,
		MatContentModule,
		MatSidenavModule,
		MatToolbarModule,
		MatFormFieldModule,
		FileSizePipeModule,
		MatPaginatorModule,
		ReactiveFormsModule,
		MatMenuButtonModule,
		MatBackButtonModule,
		MatProgressBarModule,
		RouterModule.forChild(routes)
	],
	declarations: [
		FilesPage,
		FilesViewerPage,
		FilesEditorPage,
		FilterComponent
	]
})

export class FilesPageModule { }
