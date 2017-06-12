import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { DropboxProvider } from '../../providers/dropbox';
import { ToastController } from 'ionic-angular';
import { Settings } from '../../providers/settings';

@IonicPage()
@Component({
  selector: 'page-dropbox',
  templateUrl: 'dropbox.html',
})
export class DropboxPage {

  public token: string;
  public filename: string;

  constructor(public toastCtrl: ToastController, 
              public settings: Settings,
              public dropbox: DropboxProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DropboxPage');
  }

  ionViewWillEnter() {
    this.token = this.settings.getValue('dropbox_token');
    this.filename = this.settings.getValue('dropbox_filename');
    //this.languages = this.dataProvider.getDoc('pub/global/languages');
    //console.log("Languages: ", this.languages);
  }

  saveDropboxSettings(){
    this.settings.setValue('dropbox_token', this.token);
    if(this.filename != null && this.filename != "") 
      this.settings.setValue('dropbox_filename', this.filename);

    this.dropbox.filename = this.settings.getValue('dropbox_filename');
    
  }


  async goToDropboxAuth(){  
    //this.dropbox.makeBackup();
    let m = await this.dropbox.dataSync();
    
    let toast = this.toastCtrl.create({
      message: m,
      duration: 3000
    });
    toast.present();

  }

}
