import { File } from 'src/app/classes/file';
import { environment } from 'src/environments/environment';
import { FilesService } from 'src/app/services/files/files.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { Router, ActivatedRoute } from '@angular/router';
import { OnInit, Component, OnDestroy } from '@angular/core';

@Component({
	selector: 'files-viewer-page',
	styleUrls: ['./viewer.page.scss'],
	templateUrl: './viewer.page.html'
})

export class FilesViewerPage implements OnInit, OnDestroy {

	constructor(private toast: ToastService, private route: ActivatedRoute, private router: Router, private config: ConfigService, private service: FilesService) { }

	public file: File = new File();
	public drive?: string = environment.drive;
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
			this.file = new File((response.result as any)[0]);
		} else {
			this.toast.error(response.error.message);
			this.router.navigate(['/files']);
		};

		this.loading = false;
	}

	ngOnInit(): void {
		this.observers.loaded = this.config.loaded.subscribe((loaded: boolean) => {
			if (loaded) {
				this.drive = environment.drive;
				const params = this.route.snapshot.queryParams;
				this.fileId = params.fileId;
				this.get();
			};
		});
	}

	ngOnDestroy(): void {
		this.observers.loaded.unsubscribe();
	}

}
