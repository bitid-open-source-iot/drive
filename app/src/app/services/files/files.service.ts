import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from 'src/environments/environment.prod';

@Injectable({
    providedIn: 'root'
})
export class FilesService {

    constructor(private api: ApiService) { }

    public async list(params: any) {
        return await this.api.post(environment.drive, '/drive/files/list', params);
    }

    public async share(params: any) {
        return await this.api.post(environment.drive, '/drive/files/share', params);
    }

    public async update(params: any) {
        return await this.api.post(environment.drive, '/drive/files/update', params);
    }

    public async delete(params: any) {
        return await this.api.post(environment.drive, '/drive/files/delete', params);
    }

    public async unsubscribe(params: any) {
        return await this.api.post(environment.drive, '/drive/files/unsubscribe', params);
    }

    public async changeowner(params: any) {
        return await this.api.post(environment.drive, '/drive/files/change-owner', params);
    }

    public async updatesubscriber(params: any) {
        return await this.api.post(environment.drive, '/drive/files/update-subscriber', params);
    }
    
}
