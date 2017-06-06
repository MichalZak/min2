import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

//prividers
import { Settings, Placements, DataProvider } from '../providers';

//pages
import { TabsPage } from '../pages/';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;

  constructor(public platform: Platform,
              public statusBar: StatusBar, 
              splashScreen: SplashScreen,
              public settings: Settings,
              public placements: Placements,
              public dataProvider: DataProvider) {
    platform.ready().then(() => {
      
      
      settings.load().then(res=>{
          //console.log("AppComponent -> Settings-> Load: "+JSON.stringify(res));
          console.log("App Component Load");

          placements.syncData();

          dataProvider.init().then(()=>{
            this.rootPage = TabsPage;    
          });


       });

      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}

