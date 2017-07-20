import { Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import { NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import * as _ from "lodash"
import { Call, Visit, Placement } from '../../models';
import { DataProvider } from '../../providers';
import { CallVisitPage } from './call-visit';
import * as moment from 'moment';


@Component({
  selector: 'page-call-detail',
  templateUrl: 'call-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CallDetailPage {

  public call:Call = new Call();
  public oldCall:Call;
  public subscription:any;
  minDate:any;
  maxDate:any;

  

  constructor(public navCtrl: NavController,
              public alertCtrl: AlertController,
              public toastCtrl: ToastController,
              public dataProvider: DataProvider,
              private ref: ChangeDetectorRef,
              public navParams: NavParams) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad');
  }

  ionViewDidEnter(){
    console.log("IonViewDidEnter: ", this.call);
    this.ref.markForCheck();
  }

  ionViewWillEnter() {
    this.subscription = this.dataProvider.getDocObservable(this.navParams.get('call')).subscribe(
      doc =>{
        console.log("Viewing Call Detail ", doc);
        this.call = Object.assign({}, doc);
        console.log("CallDetail Call Update", this.call);
        this.oldCall = Object.assign({}, doc);
        this.ref.markForCheck();
        //this.ref.detectChanges();
      }
    );
  }
getPubImage(value):string{
    let pub = new Placement(value)
    return pub.getImage();
}
 
ionViewWillLeave(){
    this.save(); 
    this.subscription.unsubscribe();
}

save(){
    //are we saving?
    //lets see if changes where made
    if(_.isEqual(this.call, this.oldCall))
      return; //no changes have been make, no need to save

    console.log("Yes we are: ", this.call);
    this.dataProvider.save(this.call); 
 }

 setBackDate(){
   console.log("setting up call back date"); 
   this.call.date =  moment().format('YYYY-MM-DD');
   this.ref.markForCheck();
 }

 addVisit(){
    this.viewVisit(new Visit({
      id: Date.now(),
      date: moment().format('YYYY-MM-DD'),
    }));
  }

 removeVisit(index:number){
   this.call.visits.splice(index,1);
   this.dataProvider.save(this.call);
 }

 viewVisit(visit:Visit){
   this.navCtrl.push(CallVisitPage,{visit:visit, callid:this.call._id});
 }

 addDay(){
  this.call.date =  moment(this.call.date).add(1,"d").format('YYYY-MM-DD');
 }

 removeDay(){
  this.call.date =  moment(this.call.date).subtract(1,"d").format('YYYY-MM-DD');
 }

 clearDate(){
  this.call.date =  null;
 }


}
