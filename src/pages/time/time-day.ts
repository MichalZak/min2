import { Component, ChangeDetectionStrategy, ChangeDetectorRef  } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import * as _ from "lodash";
import { saveIntoArray } from '../../utils';

import { DataProvider} from '../../providers';
import { Day, Student, Month, } from '../../models';
import * as moment from 'moment';

@Component({
  selector: 'page-time-day',
  templateUrl: 'time-day.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeDayPage {

  day:Day = new Day();
  month:Month = new Month();
  staticMonth:Month;
  subscription:any;
  daysOfWeek=['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];
  dayScroll;
  currentMonthYear:boolean;
  todayDate:number;


  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public alertCtrl: AlertController,
              private ref: ChangeDetectorRef,
              public dataProvider: DataProvider) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad TimeDayPage');
  }

  isToday(date){
    if(date===moment().date()&&this.currentMonthYear)
      return true;
    return false;
  }

  printDate():string{
    return Month.printDate(this.day.day, this.month);
  }

  getDayClass(date):Array<string> {
    if(date == this.day.day)
      return ["scroll-item", "selected"];

    return ['scroll-item'];
  }

 

  ionViewWillEnter() {
    
    this.subscription = this.dataProvider.getDocObservable(this.navParams.get('month')._id).subscribe(
      doc =>{
        this.month = new Month( Object.assign({}, doc));
        this.staticMonth = Object.assign({}, doc);
        console.log("Selected Day", this.navParams.get('date'));
        this.day = Month.findDay(this.month, this.navParams.get('date'));

        //make sure we have month
        if(!this.month.days)
          this.month.days = new Array<Day>();

        if(this.month._id == moment().format('YYYYMM'))
          this.currentMonthYear = true;


        if(this.day.returns == null)
          this.day.returns = new Array<Student>();

        if(this.day.students == null)
          this.day.students = new Array<Student>();

        //setup our dayScroll
        this.setupDayScroll();

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

  setupDayScroll(){
    let m = moment(this.month._id+'01','YYYYMMDD');
    let month = m.get('month');
    this.dayScroll = new Array<{}>();
    while(m.get('month') === month){
      this.dayScroll.push({day:m.date(), weekday:this.daysOfWeek[m.isoWeekday()-1]});
      m.add(1,'day');
    }
  }

  selectDay(dayNum){
    console.log('Day Selected', dayNum)

    //lets save the previous day
    this.day.modified_timestamp = Date.now();
    this.month.days = saveIntoArray(this.day, this.month.days, "day");

    //lets change day
    this.day = Month.findDay(this.month, dayNum);
    this.ref.markForCheck();
  }

  changeRecord(property:string, add:boolean){
    if(property=='placement' && add)
      this.day.placements++
    
    if(property=='placement'&& !add && this.day.placements > 0)
      this.day.placements--;

    if(property=='videos' && add)
      this.day.videos++
    
    if(property=='videos'&& !add && this.day.videos > 0)
      this.day.videos--;


    if(property=='hours' && add)
      this.day.hours++
    
    if(property=='hours'&& !add && this.day.hours > 0)
      this.day.hours--;


    if(property=='rvs' && add)
      this.day.rvs++
    
    if(property=='rvs' && !add && this.day.rvs > 0)
      this.day.rvs--;

    this.ref.markForCheck();
  }

  remove(publication, index){
    let prompt = this.alertCtrl.create({
      title: 'Remove Day Record',
      message: "Are you sure you want to remove this day record?",
      buttons: [
        {
          text: 'Cancel',
          handler: data=>{}//do nothing, just leave
        },
        {
          text: 'Remove',
          handler: data => {
            this.month.days.splice(index, 1);
            this.ref.markForCheck();
          }
        }
      ]
    });
    prompt.present();
  }

  save(){
    console.log("ARE WE SAVING DAY: ");
    //lets see if changes where made
    console.log("this.day", this.day);
    console.log("Params DAY",this.navParams.get("day"));
    console.log("Equal", _.isEqual(this.day, this.navParams.get('day')));

    this.day.modified_timestamp = Date.now();
    //this.month.days[this.day.day] = Object.assign({}, this.day);

    this.month.days = saveIntoArray(this.day, this.month.days, "day");
    //this.month.days = this.month.days.filter(day=>Day.checkIfHasActivity(day));
    this.month.days = _.orderBy(this.month.days, ['day'], ['asc']);

    this.dataProvider.save(this.month);
 }


}
