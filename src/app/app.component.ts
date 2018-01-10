import { Component } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Network } from '@ionic-native/network';

//prividers
import { Settings, Placements, DataProvider, OnedriveProvider, DropboxProvider } from '../providers';

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
              private network: Network,
              public events: Events,
              dropbox:DropboxProvider, 
              onedrive:OnedriveProvider,
              public dataProvider: DataProvider) {
    platform.ready().then(() => {
      
      
      settings.load().then(res=>{
          //console.log("AppComponent -> Settings-> Load: "+JSON.stringify(res));
          console.log("App Component Load");
  
          placements.init();

          //test if we have any parameter data, this is for dropbox web login
          

          dataProvider.init().then(()=>{
            console.log("**********************");
            console.log(window.location.hash.substring(1));
            let params = window.location.hash.substring(1).split('&')
            let search = window.location.search;
            console.log(params);
            let token;
            let code;
            params.forEach(p=>{
              let pp = p.split('=');
              if(pp[0]=='access_token')
                token=pp[1];
              if(pp[0]=='code')
                code=pp[1]

            })

            if(search){
              code = search.split("=")[1];
            }

            console.log("TOKEN: "+token);

            if(token){
              console.log('Saving Token');
              this.settings.setValue('dropbox_token', token);
              this.settings.setValue(DropboxProvider.SYNC_ON_NEXT_LOAD, true);
              dropbox.init();
            }
            else if(code){
              if( this.settings.getValue(OnedriveProvider.AUTHENTICATION_INITIATED) != true)
              {
                console.log("Got onedrive code", code);
                //this.settings.setValue(OnedriveProvider.ONEDRIVE_CODE, code);
                this.settings.setValue(OnedriveProvider.RECEIVED_CODE, code);
                onedrive.init();
              }              
            }
            this.rootPage = TabsPage;
            
            //see if we need to backup
            console.log("############### NETWORK: " +this.network.type);
                        
            if(this.network.type === "wifi"){
              console.log("Connected to wifi");
              if(this.settings.getValue('dropbox_auto')){
                console.log("Initiate Dropbox Auto Backup");
                dropbox.init();
                setTimeout(()=>{
                  //wait for 3 sec, by this time dropbox should be created, and initiate sync
                  console.log("Sent dropbox sync event: InitiateDropboxSync");
                  this.events.publish("InitiateDropboxSync");
                },3000);
               
               // this.dataProvider.dataSync().then(res=>{
               //   console.log("@@@@@ Dropbox Sync Finished");
              //  })
              //  .catch(err =>{
              //    console.log("Dropbox Sync Error", err);
              //  });
              }
            }
                
          });


       });

      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}

