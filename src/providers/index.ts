import { ErrorHandler } from '@angular/core';
import { IonicErrorHandler } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Network  } from '@ionic-native/network';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { EmailComposer } from '@ionic-native/email-composer';
import { InAppBrowser } from '@ionic-native/in-app-browser';

import { DataProvider } from './data-provider';
import { OnedriveProvider } from './onedrive';
import { Settings } from './settings';
import { Placements } from './placements';
import { DropboxProvider } from '../providers/dropbox';
import { LogProvider } from './logs';
import { getConfig } from '../config';

export {
  DataProvider,
  Settings,
  Placements,
  DropboxProvider,
  OnedriveProvider,
  LogProvider,

}

export function provideSettings(storage: Storage) {
  return new Settings(storage, getConfig());
}


export function GetProviders() {
  return [  
    StatusBar,
    SplashScreen,
    EmailComposer,
    DropboxProvider,
    OnedriveProvider,
    DataProvider,
    Placements,
    InAppBrowser,
    LogProvider,
    Network,
    
    { provide: Settings, useFactory: provideSettings, deps: [ Storage ] },
    // Keep this to enable Ionic's runtime error handling during development
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ];
}
