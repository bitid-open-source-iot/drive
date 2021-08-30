export class File {

    public role: number = 0;
    public size: number = 0;
    public users: any[] = [];
    public appId: string = '';
    public token: string = '';
    public fileId: string = '';
    public filename: string = '';
    public serverDate: Date = new Date();
    public uploadDate: Date = new Date();
    public contentType: string = '';
    public organizationOnly: number = 0;

    constructor(args?: FILE) {
        if (typeof(args) != 'undefined' && args != null) {
            if (typeof(args.role) != 'undefined' && args.role != null) {
                this.role = args.role;
            }
            if (typeof(args.size) != 'undefined' && args.size != null) {
                this.size = args.size;
            }
            if (typeof(args.users) != 'undefined' && args.users != null) {
                this.users = args.users;
            }
            if (typeof(args.appId) != 'undefined' && args.appId != null) {
                this.appId = args.appId;
            }
            if (typeof(args.token) != 'undefined' && args.token != null) {
                this.token = args.token;
            }
            if (typeof(args.fileId) != 'undefined' && args.fileId != null) {
                this.fileId = args.fileId;
            }
            if (typeof(args.filename) != 'undefined' && args.filename != null) {
                this.filename = args.filename;
            }
            if (typeof(args.serverDate) != 'undefined' && args.serverDate != null) {
                this.serverDate = new Date(args.serverDate);
            }
            if (typeof(args.uploadDate) != 'undefined' && args.uploadDate != null) {
                this.uploadDate = new Date(args.uploadDate);
            }
            if (typeof(args.contentType) != 'undefined' && args.contentType != null) {
                this.contentType = args.contentType;
            }
            if (typeof(args.organizationOnly) != 'undefined' && args.organizationOnly != null) {
                this.organizationOnly = args.organizationOnly;
            }
        }
    }

}

interface FILE {
    role?: number;
    size?: number;
    users?: any[];
    appId?: string;
    token?: string;
    fileId?: string;
    filename?: string;
    serverDate?: Date;
    uploadDate?: Date;
    contentType?: string;
    organizationOnly?: number;
}