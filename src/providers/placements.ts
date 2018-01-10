import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular'; 
import {Placement } from '../models';
import { Settings } from './settings';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';
import * as _ from "lodash";
import { Doc } from '../models';
import 'rxjs/add/operator/map';


@Injectable()
export class Placements {

  private _docs:Array<Placement>;
  public config:Doc;

  private _fileUrl = "assets/data/pubs_e.json";

  constructor(public http: Http,
              private platform: Platform,
              public settings: Settings) {
    console.log('Hello Placements Provider');
  }


  getDocs(){
    return this._docs;
  }

  getDoc(id:string):Doc{
    return this._docs.find( (doc)=> {
       return (doc._id === id)

    });
  }



  //Here we load the json files into an array
  public init(){
    console.log("*********************");
    try{
      this.http.get(this._fileUrl)
        .map((res:Response ) => <any> res.json())
        .do(data =>{
          this._docs = data.filter(doc => doc.pubType !== "settings").map(doc=>new Placement(doc));
          this.config = data.find(doc => doc.pubType === "settings");
          console.log(JSON.stringify(data))
        })
        .subscribe();
 
    }
    catch(e){
      console.log(e);
    }
    
  }



}
