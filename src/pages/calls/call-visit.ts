import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, AlertController, ModalController  } from 'ionic-angular';
import { Call, Visit, Placement } from '../../models';
import { DataProvider } from '../../providers';
//import * as moment from 'moment';
import * as _ from "lodash";
import { saveIntoArray } from '../../utils';
import { VisitPlacementsPage } from '../'

@Component({
  selector: 'page-call-visit',
  templateUrl: 'call-visit.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CallVisitPage {

  call:Call = new Call();
  visit:Visit = new Visit();
  subscription:any;
  minDate:any;
  maxDate:any;

  constructor(public navCtrl: NavController,
              public alertCtrl: AlertController,
              public modalCtrl: ModalController ,
              public dataProvider: DataProvider,
              private ref: ChangeDetectorRef,
              public navParams: NavParams) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad CallVisitPage');
  }

  ionViewWillEnter() {

    this.subscription = this.dataProvider.getDocObservable(this.navParams.get('callid')).subscribe(
      doc =>{
        this.call = Object.assign({}, doc);

        if(this.call.visits == null)
          this.call.visits = new Array<Visit>();

        this.visit =_.merge({}, this.navParams.get('visit'));

        if(this.visit.placements == null)
          this.visit.placements = new Array<Placement>();

        this.ref.markForCheck();
        //this.ref.detectChanges();
      }
    );

  }

  ionViewDidEnter(){
    this.ref.markForCheck();
  }

  ionViewWillLeave(){
    this.save(); 
    this.subscription.unsubscribe();
  }

  getPubImage(value):string{
    let pub = new Placement(value)
    return pub.getImage();
  }

  remove(publication, index){
    let prompt = this.alertCtrl.create({
      title: 'Remove '+ publication.name,
      message: "Are you sure you want to remove this placement?",
      buttons: [
        {
          text: 'Cancel',
          handler: data=>{}//do nothing, just leave
        },
        {
          text: 'Remove',
          handler: data => {
            this.visit.placements.splice( index, 1 );
            this.ref.markForCheck();
          }
        }
      ]
    });
    prompt.present();
  
  }

  save(){
    console.log("ARE WE SAVING VISIT: ");
    //lets see if changes where made
    console.log("this.visit", this.visit);
    console.log("Params Visit",this.navParams.get("visit"));
    console.log("Equal", _.isEqual(this.visit, this.navParams.get("visit")));
    if(_.isEqual(this.visit, this.navParams.get("visit")))
      return; //no changes have been make, no need to save
    
    console.log("VISIT YES WE ARE");
    this.call.visits = saveIntoArray(this.visit, this.call.visits, "id");
    console.log("** New Visit Array: ", this.call.visits);
    this.call.visits = _.orderBy(this.call.visits, ['date'], ['desc']);

    this.dataProvider.save(this.call);
    //this.dataProvider.tempStore['call'] = this.call;
 }

  addPlacement(){
    let modal = this.modalCtrl.create(VisitPlacementsPage, {
      enableBackdropDismiss: true,
      showBackdrop: true
    });
    modal.onDidDismiss(data => {
      console.log(data);

      if(data){
        this.visit.placements.push(data);
        this.ref.markForCheck();
      }
    });

    modal.present();
  }
}
