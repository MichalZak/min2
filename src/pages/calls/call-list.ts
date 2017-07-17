import { Component, ChangeDetectionStrategy, ChangeDetectorRef  } from '@angular/core';
import { NavController, AlertController, MenuController, } from 'ionic-angular';
import { generateId } from '../../utils';
import { CallDetailPage } from '../';
import { Call } from '../../models';
import { DataProvider } from '../../providers';
//import * as _ from "lodash"
import * as moment from 'moment';



@Component({
  selector: 'page-call-list',
  templateUrl: 'call-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CallListPage {

  public calls:Call[];
  public all:Call[];
  public subscription:any;
  public sortType:string = 'priority';

  constructor(public navCtrl: NavController,
              public alertCtrl: AlertController,
              private ref: ChangeDetectorRef,
              public menuCtrl: MenuController,
              public dataProvider: DataProvider) {

  }

  onSortChange(type:string){
    this.calls = this.sortRecords(this.all, type);
    this.ref.markForCheck();
    console.log("Sorting Ended", this.calls);
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad');

    this.subscription = this.dataProvider.getDocsObservable('call').subscribe(
      docs =>{
        this.all = docs;
        this.calls = this.sortRecords(this.all, this.sortType);
        this.ref.markForCheck();
      },
      err =>{
        //onError
        console.log(err);
      },
      () =>{
        //onComplted
        console.log("Subscription Completed");
      }
    );
  }


  getDayOffset(date:string):number{
    //this.minDate = moment.utc().subtract(2,'y').format('YYYY-MM-DD');
    let now = moment();
    let d = moment(date);
    let days = d.diff(now,'days');

    if(days === 0)
      return null;
    return days;
  }

  getDateColor(date:string){
    let days = this.getDayOffset(date);

    if(!days)
      return 'primary';
    
    if(days === 1)
      return 'secondary';

    if(days < 0)
      return 'danger';

    return 'dark'
  }


  ionViewWillUnload(){
    this.subscription.dispose();
  }

  view(id:string){
    this.navCtrl.push(CallDetailPage,{call:id});
  }

  add(){

    let c = new Call({_id: generateId("min/call"),
      type: "call"
    });

    this.dataProvider.save(c)
    .then(res=>{
      //lets see what we have
      console.log("MADE NEW CALL", res);
      this.view(res.id);
    })
    .catch(err=>{
      console.log("ERROR CREATING CALL", err);
    });  
  }

  remove(item:any){
    let prompt = this.alertCtrl.create({
      title: 'Remove Call',
      message: "Are you sure you want to delete this call?",
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


  sortRecords(records:Array<any>, sortType:string):any{
    if(sortType === 'priority'){
        console.log("Sort Priority");
        let docs  = records.filter(doc => (doc['callType']!= "stopped") )
        return records.filter(doc => doc['callType']!= "stopped" )
                       .sort(this.sortByPriority);
    }    
    else if(sortType === 'date'){
      console.log("Sort Date");
      return records.filter(doc => (doc['callType']!= "stopped") )
                    .sort(this.sortByDate);
    }
    else if(sortType === "name"){
      console.log("Sort Name");
      return records.filter(doc => (doc['callType']!= "stopped") )
                    .sort(this.sortByName);
    }
    else{
      console.log("Sort Inactive");
      return records.filter(doc => (doc['callType'] === "stopped") )
                    .sort(this.sortByName);
    }    
  }


  sortByPriority(a, b){
    let aa = a.priority || 0;
    let bb = b.priority || 0;

    if(aa < bb)
      return 1;

    if(aa > bb)
      return -1;


    aa = a.date || '';
    bb = b.date || '';

    if(aa < bb)
      return -1;

    if(aa > bb)
      return 1;

    aa = a.name || '';
    bb = b.name || '';
    if(aa < bb)
      return -1;

    if(aa > bb)
      return 1;

    return 0;
  }
  
  sortByDate(a, b){
    let aa; 
    let bb; 

    aa = a.date || 'zzzzzz';
    bb = b.date || 'zzzzzz';

    if(aa < bb)
      return -1;

    if(aa > bb)
      return 1;

    aa = a.name || '';
    bb = b.name || '';
    if(aa < bb)
      return -1;

    if(aa > bb)
      return 1;

    return 0;

  }

  sortByName(a, b){
    let aa = a.name || '';
    let bb = b.name || '';

    if(aa < bb)
      return -1;

    if(aa > bb)
      return 1;


    aa = a.date || 'zzzzzz';
    bb = b.date || 'zzzzzz';

    if(aa < bb)
      return -1;

    if(aa > bb)
      return 1;

    aa = a.priority || 0;
    bb = b.priotiry || 0;

    if(aa < bb)
      return -1;

    if(aa > bb)
      return 1;

    return 0;

  }




}
