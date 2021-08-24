/* --- MODULES --- */
import { NgModule } from '@angular/core';
import { UpdateModule } from './libs/update/update.module';
import { BrowserModule } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SplashscreenModule } from './libs/splashscreen/splashscreen.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

/* --- SERVICES --- */
import { ApiService } from './services/api/api.service';
import { AuthManager } from './services/auth/auth.service';
import { ToastService } from './services/toast/toast.service';
import { ConfigService } from './services/config/config.service';
import { FiltersService } from './services/filters/filters.service';
import { SettingsService } from './services/settings/settings.service';
import { FormErrorService } from './services/form-error/form-error.service';
import { LocalstorageService } from './services/localstorage/localstorage.service';

/* --- COMPONENTS --- */
import { AppComponent } from './app.component';

/* --- ENVIRONMENT --- */
import { environment } from '../environments/environment';
import { AccountService } from './services/account/account.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
    imports: [
        UpdateModule,
        MatIconModule,
        BrowserModule,
        MatListModule,
        MatButtonModule,
        MatFormFieldModule,
        MatToolbarModule,
        MatSidenavModule,
        AppRoutingModule,
        HttpClientModule,
        MatSnackBarModule,
        SplashscreenModule,
        BrowserAnimationsModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: environment.production,
            registrationStrategy: 'registerWhenStable:30000'
        })
    ],
    providers: [
        ApiService,
        AuthManager,
        ToastService,
        ConfigService,
        FiltersService,
        AccountService,
        SettingsService,
        FormErrorService,
        LocalstorageService
    ],
    bootstrap: [
        AppComponent
    ],
    declarations: [
        AppComponent
    ]
})

export class AppModule { }
