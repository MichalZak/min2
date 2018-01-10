import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { Placements } from '../../providers'; 
import { Placement } from '../../models';

@Component({
  selector: 'page-visit-placements',
  templateUrl: 'visit-placements.html'
})
export class VisitPlacementsPage {

  categories:Array<any>;
  language:string = 'chs';

  constructor(public viewCtrl: ViewController , 
              public placemenets: Placements) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad VisitVideosPage');
  }

  ionViewWillEnter(save:boolean = true) {
    //this.items = this.placemenets.getBooks();
    //this.studyList = this.placemenets.getBooks().filter(doc=> (doc.category === 'study' && doc.type === 'book' ))
    //English
    this.categories = new Array<any>();
    var cats =  this.placemenets.config['categories'];
    let docs_e = this.placemenets.getDocs().filter(doc=> doc.language === 'E');
    cats.forEach(cat=>{
      let pubs = docs_e.filter(doc=> doc.pubType === cat.pubType);
      if(cat.category)
        pubs = pubs.filter(doc => doc.category === cat.category)

      //now lets order them, for mags we need opposite
      if(cat.pubType === 'mag'){
        pubs.sort(this.sortMags);
      }
      else if(cat.pubType === 'settings'){
          
      }
      else
        pubs.sort(this.sortFunction);

      this.categories.push({heading: cat.name, priority: cat.priority,  publications:pubs});
    });
  }


  sortFunction(a:Placement, b:Placement){
    if(a.getPriority() < b.getPriority())
      return 1;
    if(a.getPriority() > b.getPriority()) 
      return -1;
    if(a.name < b.name)
      return -1;
    if(a.name > b.name)
      return 1;
    return 0;
  }

  sortMags(a:Placement, b:Placement){
    if(a.name < b.name)
      return 1;
    if(a.name > b.name)
      return -1;
    return 0;
  }


  select(item:any){
    this.viewCtrl.dismiss(item);
  }

  close(){
    this.viewCtrl.dismiss();
  }

}
