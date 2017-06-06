import { Component, Input } from '@angular/core';


@Component({
  selector: 'page-placements-component',
  templateUrl: 'placements-component.html'
})
export class PlacementsComponentComponent{


  @Input()
  public heading:String = "hey";

  @Input()
  public publications:any;

  constructor() {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad PlacementsComponentPage');
  }

}
