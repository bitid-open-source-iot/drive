export class App {

    public icon: string = '';
    public name: string = '';
    public appId: string = '';

    constructor(args?: APP) {
        if (typeof (args) != 'undefined' && args != null) {
            if (typeof (args.icon) != 'undefined' && args.icon != null) {
                this.icon = args.icon;
            }
            if (typeof (args.name) != 'undefined' && args != null) {
                this.name = args.name;
            }
            if (typeof (args.appId) != 'undefined' && args.appId != null) {
                this.appId = args.appId;
            }

        }
    }

}

interface APP {
    icon?: string;
    name?: string;
    appId?: string;
}