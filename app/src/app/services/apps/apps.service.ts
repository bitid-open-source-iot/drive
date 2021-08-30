import { App } from 'src/app/classes/app';
import { ApiService } from '../api/api.service';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})

export class AppsService {

    public data: App[] = [];

    constructor(private api: ApiService) { }

    public async list(params: any) {
        return await this.api.post(environment.auth, '/apps/list', params);
    }

}
