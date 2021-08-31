/* --- PAGES --- */
import { SubscribersPage } from './subscribers.page';
import { UserEditorDialog } from './editor/editor.dialog';

/* --- MODULES --- */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ConfirmModule } from 'src/app/libs/confirm/confirm.module';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatContentModule } from 'src/app/libs/mat-content/mat-content.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatBackButtonModule } from 'src/app/libs/mat-back-button/mat-back-button.module';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
	{
		path: '',
		component: SubscribersPage
	}
];

@NgModule({
	imports: [
		FormsModule,
		CommonModule,
		ConfirmModule,
		MatTabsModule,
		MatIconModule,
		MatListModule,
		MatTableModule,
		MatInputModule,
		MatRippleModule,
		MatDialogModule,
		MatButtonModule,
		MatSelectModule,
		MatContentModule,
		MatToolbarModule,
		FlexLayoutModule,
		MatFormFieldModule,
		MatPaginatorModule,
		ReactiveFormsModule,
		MatBackButtonModule,
		RouterModule.forChild(routes)
	],
	declarations: [
		SubscribersPage,
		UserEditorDialog
	]
})

export class SubscribersPageModule { }
