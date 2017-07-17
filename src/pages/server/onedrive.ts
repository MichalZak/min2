import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { OnedriveProvider } from '../../providers/onedrive';
import { ToastController } from 'ionic-angular';
import { Settings } from '../../providers/settings';

@IonicPage()
@Component({
  selector: 'page-onedrive',
  templateUrl: 'onedrive.html',
})
export class OnedrivePage {

  public token: string;
  public filename: string;
  public autoBackup: boolean;

  constructor(public toastCtrl: ToastController, 
              public settings: Settings,
              public onedrive: OnedriveProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OnedrivePage');
  }

  ionViewWillEnter() {
    this.token = this.settings.getValue('onedrive_token');
    this.filename = this.settings.getValue('onedrive_filename');
    this.autoBackup = this.settings.getValue('onedrive_auto');
    //this.languages = this.dataProvider.getDoc('pub/global/languages');
    //console.log("Languages: ", this.languages);
  }

  onedriveAutoChanged(){
    console.log("onedriveAutoChanged: "+this.autoBackup);
    this.settings.setValue('onedrive_auto', this.autoBackup);

  }
   



  saveOnedriveSettings(){
    this.settings.setValue('onedrive_token', this.token);
    if(this.filename != null && this.filename != "") 
      this.settings.setValue('onedrive_filename', this.filename);

    this.onedrive.filename = this.settings.getValue('onedrive_filename');
    
  }


  async goToOnedriveAuth(){  
    //this.onedrive.makeBackup();
    let m = await this.onedrive.dataSync();
    
    let toast = this.toastCtrl.create({
      message: m,
      position: 'middle',
      duration: 2000
    });
    toast.present();

  }

}
