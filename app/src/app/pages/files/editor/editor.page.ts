import { File } from 'src/app/classes/file';
import { ToastService } from 'src/app/services/toast/toast.service';
import { FilesService } from 'src/app/services/files/files.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { FormErrorService } from 'src/app/services/form-error/form-error.service';
import { Router, ActivatedRoute } from '@angular/router';
import { OnInit, Component, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
	selector: 'files-editor-page',
	styleUrls: ['./editor.page.scss'],
	templateUrl: './editor.page.html'
})

export class FilesEditorPage implements OnInit, OnDestroy {

	constructor(private toast: ToastService, private route: ActivatedRoute, private router: Router, private config: ConfigService, private service: FilesService, private formerror: FormErrorService) { }

	public form: FormGroup = new FormGroup({
		appId: new FormControl(null, [Validators.required]),
		filename: new FormControl(null, [Validators.required])
	});
	public errors: any = {
		appId: '',
		filename: ''
	};
	public mode?: string; // add, copy, update
	public fileId?: string;
	public loading?: boolean;
	private observers?: any = { };

	private async get() {
		this.loading = true;

		const response = await this.service.list({
			filter: [
				'size',
				'role',
				'appId',
				'token',
				'fileId',
				'filename',
				'uploadDate',
				'serverDate',
				'contentType',
				'organizationOnly'
			],
			fileId: this.fileId
		});

		if (response.ok) {
			const file = new File((response.result as any)[0]);
			if (file.role >= 2) {
				this.form.controls.appId.setValue(file.appId);
				this.form.controls.filename.setValue(file.filename);
			} else {
				this.toast.error('You do not have permissions to ' + this.mode + ' this file!');
				this.router.navigate(['/files']);
			}
		} else {
			this.toast.error(response.error.message);
			this.router.navigate(['/files']);
		};

		this.loading = false;
	}

	public async submit() {
		this.loading = true;

		const response = await this.service.update({
			fileId: this.fileId,
			filename: this.form.value.filename
		});

		if (response.ok) {
			this.toast.success('Update complete!');
			this.router.navigate(['/files']);
		} else {
			this.toast.error(response.error.message);
		};

		this.loading = false;
	}

	ngOnInit(): void {
		this.observers.form = this.form.valueChanges.subscribe((data: any) => {
			this.errors = this.formerror.validateForm(this.form, this.errors, true);
		});

		this.observers.loaded = this.config.loaded.subscribe((loaded: boolean) => {
			if (loaded) {
				const params = this.route.snapshot.queryParams;
				this.mode = params.mode;
				this.fileId = params.fileId;
				if (this.mode != 'add') {
					this.get();
				};
			};
		});
	}

	ngOnDestroy(): void {
		this.observers.form.unsubscribe();
		this.observers.loaded.unsubscribe();
		
	}

}
