import { Component, ChangeDetectionStrategy, ChangeDetectorRef  } from '@angular/core';
import { NavController, AlertController, MenuController, } from 'ionic-angular';

import { generateId } from '../../utils';
import { NoteDetailPage } from '../';
import { Note } from '../../models';
import { DataProvider } from '../../providers';


interface OrderBy {
    date?:string,
    rating?:string,
    type?:string,
    asc?:string,
    desc?:string,
}


@Component({
  selector: 'page-note-list',
  templateUrl: 'note-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoteListPage {

  public notes:Note[];
  public subscription:any;

  constructor(public navCtrl: NavController,
              public alertCtrl: AlertController,
              private ref: ChangeDetectorRef,
              public menuCtrl: MenuController,
              public dataProvider: DataProvider) {}


  ionViewDidLoad() {
    console.log('ionViewDidLoad NoteListPage');

    this.subscription = this.dataProvider.getDocsObservable('note').subscribe(
      docs =>{
        //onNext
        console.log(docs);
        this.notes = docs.sort(this.sortByPriority);
        //this.ref.detectChanges();
        this.ref.markForCheck();
      },
      err =>{
        //onError
        console.log(err);
      },
      () =>{
        //onComplted
        console.log("Note Subscription Completed");
      }
    );
  }

  ionViewWillUnload(){
    this.subscription.dispose();
  }

  view(item:any){
    this.navCtrl.push(NoteDetailPage,{note:item});
  }

  add(){
    this.view(new Note({
      _id: generateId("min/note"),
      type: "note"
    }));
  }

  remove(item:any){
    let prompt = this.alertCtrl.create({
      title: 'Remove Note',
      message: "Are you sure you want to delete this note?",
      buttons: [
        {
          text: 'Cancel',
          handler: data=>{}//do nothing, just leave
        },
        {
          text: 'Remove',
          handler: data => {
            this.dataProvider.remove(item)
          }
        }
      ]
    });
    prompt.present();
  
  }

   sortByPriority(a, b){
    let aa = a.priority || 0;
    let bb = b.priority || 0;

    if(aa < bb)
      return 1;

    if(aa > bb)
      return -1;

    aa = a.name || '';
    bb = b.name || '';
    if(aa < bb)
      return -1;

    if(aa > bb)
      return 1;

    return 0;
  }


}
