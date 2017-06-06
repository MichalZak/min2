import { Component } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';
import { DataProvider } from '../../providers';
import { EmailComposer } from '@ionic-native/email-composer';
import { Platform } from 'ionic-angular'; 

//import { EmailComposer } from '@ionic-native/email-composer';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  languages:any;

  constructor(public navCtrl: NavController, 
              public platform: Platform,
              public navParams: NavParams, 
              public emailComposer: EmailComposer,
              public dataProvider: DataProvider, 
              public events:Events) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad AboutPage');
  }

  ionViewWillEnter() {
    //this.languages = this.dataProvider.getDoc('pub/global/languages');
    //console.log("Languages: ", this.languages);
  }

  goToAuth(){
      //this.navCtrl.push(WelcomePage);
  }

  emailBackup(){
    if (this.platform.is('cordova')) {  
      try {
        this.emailComposer.isAvailable().then((available: boolean) =>{
             if(available) {
               console.log("Ready to send email");
               let email = {
                to: 'max@mustermann.de',
                cc: 'erika@mustermann.de',
                bcc: ['john@doe.com', 'jane@doe.com'],
                attachments: [
                  'file://img/logo.png',
                  'res://icon.png',
                  'base64:icon.png//iVBORw0KGgoAAAANSUhEUg...',
                  'file://README.pdf'
                ],
                subject: 'Cordova Icons',
                body: 'How are you? Nice greetings from Leipzig',
                isHtml: true
              };

              this.emailComposer.open(email);

             }
             else {
               console.log("Email plugin not available22");
             }
          });
      }
      catch(e){
        console.log("Email error ", e);
      }
    
    }
    else {
      console.log("Email plugin not available");
    }
  }





}
