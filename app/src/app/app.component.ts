import { SplashScreen } from './libs/splashscreen/splashscreen';
import { OnInit, Component, ViewChild } from '@angular/core';

@Component({
    selector: 'app-root',
    styleUrls: ['./app.component.scss'],
    templateUrl: './app.component.html',
})

export class AppComponent implements OnInit {

    @ViewChild(SplashScreen, { static: true }) private splashscreen?: SplashScreen

    constructor() { }

    ngOnInit(): void {
        // this.splashscreen?.show();
        // this.splashscreen?.hide();
    }

}
