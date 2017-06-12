import { Component } from '@angular/core';
import { IonicPage  } from 'ionic-angular';
import { LogProvider } from '../../providers/logs'

@IonicPage()
@Component({
  selector: 'page-logs',
  templateUrl: 'logs.html',
})
export class LogsPage {

  logs:any = [];

  constructor(public logProvider: LogProvider) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LogsPage');
  }

  ionViewWillEnter(){
    console.log('ionViewWillEnter LogsPage');
    this.logs = this.logProvider.logs;
    console.log(this.logs);
  }

}
