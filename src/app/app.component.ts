import { Component } from '@angular/core';
import { Platform,NavController, NavParams } from 'ionic-angular';
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

          //test if we have any parameter data, this is for dropbox web login
          

          dataProvider.init().then(()=>{
            let s:string;
            console.log("**********************");
            console.log(window.location.hash.substring(1));
            let params = window.location.hash.substring(1).split('&')
            console.log(params);
            let token;
            params.forEach(p=>{
              let pp = p.split('=');
              if(pp[0]=='access_token')
                token=pp[1];
            })

            console.log("TOKEN: "+token);

            if(token){
              console.log('Saving Token');
              this.settings.setValue('dropbox_token', token);
              this.settings.setValue('DropboxSyncOnNextLoad', true);
            }
            this.rootPage = TabsPage;
            //}
                
          });


       });

      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}

