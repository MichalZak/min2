import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular'; 
import * as moment from 'moment';


@Injectable()
export class LogProvider {

  public logs: Array<any> = new Array();
  
  constructor(private platform: Platform) {}

  print(m1 = null, m2 = null){
    if(this.platform.is('cordova')){
      //conrova logs can't handle multiple vals in console, so split
      if(m1)
        console.log(m1);
      if(m2)
        console.log(m2);
    }
    else
      console.log(m1,m2);
      this.addLog(m1, m2);
  }

  addLog(m1 = null, m2=null){
    if(m1)
      if(m2)
        this.logs.push({m1:m1, m2: JSON.stringify(m2), date: moment().format("h:mm:ss a")});
      else
        this.logs.push({m1:m1, date: moment().format("h:mm:ss a")});
  }



  
}
