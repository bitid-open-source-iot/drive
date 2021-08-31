export class User {

    public role: number = 0;
    public email: string = '';

    constructor(args?: USER) {
        if (typeof (args) != 'undefined' && args != null) {
            if (typeof (args.role) != 'undefined' && args.role != null) {
                this.role = args.role;
            }
            if (typeof (args.email) != 'undefined' && args != null) {
                this.email = args.email;
            }

        }
    }

}

interface USER {
    role?: number;
    email?: string;
}