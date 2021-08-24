import { MatDialogRef } from '@angular/material/dialog';
import { Component, ViewEncapsulation } from '@angular/core';

@Component({
	selector: 'update-dialog',
	styleUrls: ['./update.dialog.scss'],
	templateUrl: './update.dialog.html',
	encapsulation: ViewEncapsulation.None
})

export class UpdateDialog {

	constructor(private dialog: MatDialogRef<UpdateDialog>) { }

	public update() {
		this.dialog.close(true);
	}

}
