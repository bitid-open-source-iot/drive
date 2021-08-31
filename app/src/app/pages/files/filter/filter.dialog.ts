import { AppsService } from 'src/app/services/apps/apps.service';
import { Inject, OnInit, Component } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup } from '@angular/forms';
import { App } from 'src/app/classes/app';

@Component({
    selector: 'files-filter-dialog',
    styleUrls: ['./filter.dialog.scss'],
    templateUrl: './filter.dialog.html',
})

export class FilesFilterDialog implements OnInit {

    constructor(public apps: AppsService, private dialog: MatDialogRef<FilesFilterDialog>, @Inject(MAT_DIALOG_DATA) private config: any) { }
    
	public loading?: boolean;

	public form: FormGroup = new FormGroup({
		appId: new FormControl(this.config.appId)
	})

    public close() {
        this.dialog.close(false);
    }

    public submit() {
        this.dialog.close(this.form.value);
    }

	private async load() {
		this.loading = true;

		const response = await this.apps.list({
			filter: [
				'name',
				'icon',
				'appId'
			]
		});

		if (response.ok) {
			this.apps.data = response.result.map((o: any) => new App(o));
		} else {
			this.apps.data = [];
		};

		this.loading = false;
	}

    ngOnInit(): void {
        this.load();
    }
    
}
