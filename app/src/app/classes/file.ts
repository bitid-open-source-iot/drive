export class File {

    public fileId?: string;

    constructor(args?: FILE) {
        if (typeof(args) != 'undefined' && args != null) {
            if (typeof(args.fileId) != 'undefined' && args.fileId != null) {
                this.fileId = args.fileId;
            }
        }
    }

}

interface FILE {
    fileId?: string;
}