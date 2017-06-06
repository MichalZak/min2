import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import _ from "lodash";
import { Note } from '../../models';
import { DataProvider } from '../../providers';

@Component({
  selector: 'page-note-detail',
  templateUrl: 'note-detail.html'
})
export class NoteDetailPage {

  public note:Note = new Note();

  constructor(public navCtrl: NavController,
              public alertCtrl: AlertController,
              public toastCtrl: ToastController,
              public dataProvider: DataProvider,
              public navParams: NavParams) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad NoteDetailPage');
  }
  ionViewWillEnter() {
    this.note = Object.assign({}, this.navParams.get("note")); 
  }

  ionViewWillLeave(){
    this.save(); 
  }

  save(){

    //lets see if changes where made
    if(_.isEqual(this.note,this.navParams.get("note")))
      return; //no changes have been make, no need to save

    this.dataProvider.save(this.note);
   }

   cleanLeave(){
     this.note = this.navParams.get("note");
     this.navCtrl.pop();
   }

}
