import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular'; 
import {Placement } from '../models';
import { Settings } from './settings';
import PouchDB from 'pouchdb';
import * as _ from "lodash";
import { Doc } from '../models';
import 'rxjs/add/operator/map';


@Injectable()
export class Placements {

  private _pouch:any;
  private _pouchRemote:any;
  private _docs:Array<Placement>;

  private _localPouchOptions = {
    revs_limit: 10,
    auto_compaction: true
  } 


  constructor(private platform: Platform,
              public settings: Settings) {
    console.log('Hello Placements Provider');
  }


  getDocs(){
    return this._docs;
  }

  getDoc(id:string):Doc{
    return this._docs.find(doc=> doc._id === id);
  }

  //Call this when loading app
  public syncData(){
    this.initPouch("min_publications", 
      this.settings.getValue('database_properties')).then(res => {
      //this.checkForUpdates();
    });
  }

  private initPouch(pouchName:string, remotedb:string=''):Promise<any> {
    console.log('Placements->initDB localName: '+JSON.stringify(pouchName));
    return this.platform.ready().then(()=>{
      this._pouch = new PouchDB(pouchName, this._localPouchOptions);
      window['PouchDB'] = PouchDB;//make it visible for chrome extension

      //lets load all the data and then listen to all the changes
      //lets init db, and load all the docs
      this._pouch.allDocs({include_docs: true})
        .then(doc => {
          //console.log("Init Docs: "+JSON.stringify(doc));

          
          //this.loadAllDocs(doc.rows);
          let state:Placement[] = doc.rows.map(row =>{
            if(row.doc._id === 'pub/setup/e')
              console.log('found e settings doc', row.doc);
             let p = new Placement(row.doc);
             return p;
          });
          this.loadAllDocs(state);

        });

      
      //now watch for changes
      this._pouch.changes({live: true, since: 'now', include_docs:true})
        .on('change', change => {
           console.log('Changes obj:'+JSON.stringify(change));
           if (change['deleted']) {
                this.removeSuccessful(change.doc);
            } 
            else {
              console.log('PouchChange:'+JSON.stringify(change));
              this.saveSuccessful(change.doc); 
            }
         })

      //connect to remote 
      if(remotedb != '')
        this.initRemotePouch(remotedb); 
    });//end of platform ready
  }




  private initRemotePouch(remotedb:string){
    //console.log("DataProvider init Remote url: "+JSON.stringify(remotedb));    
    this._pouchRemote = new PouchDB(remotedb);

    this._pouch.replicate.from(this._pouchRemote)
        .on('change', function (info) {
          // handle change
          console.log('DataProvider Pouch Sync OnChange:'+JSON.stringify(info));
        }).on('paused', function (err) {
          // replication paused (e.g. replication up to date, user went offline)
          console.log('DataProvider Pouch Sync OnPaused:'+JSON.stringify(err));
        }).on('active', function () {
          // replicate resumed (e.g. new changes replicating, user went back online)
          console.log('DataProvider Pouch Sync OnActive');
        }).on('denied', function (err) {
          // a document failed to replicate (e.g. due to permissions)
          console.log('DataProvider Pouch Sync OnDenied:'+JSON.stringify(err));
        }).on('complete', function (info) {
          // handle complete
          console.log('DataProvider Pouch Sync OnComplete:'+JSON.stringify(info));
        }).on('error', function (err) {
          // handle error
          console.log('DataProvider Pouch Sync OnErr:'+JSON.stringify(err));
        });
    }

  /*
  checkForUpdates(keys = ['global']){
    //here we would load what languages from settings
    //var url = this.settings.getValue('web_url');
    var lastUpdate = this.settings.getValue('update_date') || '';
    keys.forEach(key =>{
      let seq = this.api.get('getupdates', {key:key, date:lastUpdate});

      seq
        .map(res => res.json())
        .subscribe(res =>{
          console.log('Loaded for Settings/'+key, res);
          res.forEach(doc =>{
            console.log("Updating doc", doc);
            this.save(doc);
          });
        }, err =>{
          console.log('Loading Settings Error', err);
        });

    })//forEach
  }
  */
  

  save(doc:Doc): Promise<any>{
    return new Promise((resolve,reject) =>{
      //merging so first get the doc
      this._pouch.get(doc._id).then(doc2 =>{
        //doc already exists, so lets modify it with latest values
        //first remove old rev value
        console.log("Doc found, lets merge it: ", doc2);

        this._pouch.put(_.merge({}, doc2, doc ))
          .then((res)=>{
            resolve(res);
          })
          .catch(err=>{
            console.log('Datarovider Save/Merge Error:'+JSON.stringify(err));
            reject(err);
          });
      }).catch(err =>{
        //no doc found so lets just save new
        this._pouch.put(doc)
          .then((res)=>{
            resolve(res);
          })
          .catch(err=>{
            console.log('Datarovider Save Error:'+JSON.stringify(err));
            reject(err);
          }); 
      });//end of catche
    });//end of promise
  }

  _save(doc:Doc): Promise<any>{
    return new Promise((resolve,reject) =>{
      console.log('DataProvider->save doc: ', doc);
      this._pouch.put(doc)
        .then((res)=>{
          resolve(res);
        })
        .catch(err=>{
          console.log('Datarovider Save Error:'+JSON.stringify(err));
          reject(err);
        }); 
      })
  }

  remove(doc:Doc): Promise<Doc>{
    return new Promise((res,rej) =>{
        this._pouch.get(doc._id).then((doc)=>{
            doc._deleted = true;
            res(this._pouch.put(doc));
        })
    });
  }


  private loadAllDocs(docs:Placement[]){
    this._docs = docs;
  }

    private removeSuccessful(doc:any){
    //console.log('DocReducer->REMOVE_SUCCESS: '+JSON.stringify(doc));
    this._docs = this._docs.filter(d=>d._id !== doc._id);

  }

  private saveSuccessful(doc:any){
    //we have changes being made to pub database
    console.log("*****CHANGES BEING MADE", doc);
    this._docs = this.saveIntoArray(doc, this._docs);
    //need to load image file
    //TODO: check if the image exists, if not upload it
  }


  saveIntoArray(item:Object, ary:Array<any>, idKey:string='_id'):Array<any>{
  var i = this.getIndexById(item[idKey],ary,idKey);
      if(i== -1)
        i=ary.length;
      return [  ...ary.slice(0, i),
                new Placement(Object.assign({},item)),
                ...ary.slice(i + 1) ]
  }
  getIndexById(id:string, ary:any, idKey:string = '_id'):number{
   for(var i = 0; i < ary.length; i++){
        if(id === ary[i][idKey])
          return i;
      }

      //if we don't have a match return null
      return -1;
  }


}
