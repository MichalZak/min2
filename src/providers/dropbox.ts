import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, ResponseContentType  } from '@angular/http';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Platform, Events } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import Dropbox  from 'dropbox';
import { DataProvider } from './data-provider';
import { LogProvider } from './logs'
import { Settings } from './settings';
import CryptoJS from 'crypto-js';
import { TextDecoder } from 'text-encoding-shim';


import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import {delay} from "../utils";

@Injectable()
export class DropboxProvider {
 
  static SYNC_ON_NEXT_LOAD:string = "DropboxSyncOnNextLoad";


  initialized:boolean;
  accessToken: any;// = "d-e6T61aqsoAAAAAAAAgekf6inrXDPP0QuOIYELJ03rOniXWAQxgMsEJgyIfC8q0";
  filename:string;
  folderHistory: any = [];
  appKey: any;
  redirectURI: any;




  //encrption
  key:string  = "23dsff@#$sdffwdsf234234234";


  constructor( public http: Http,
               public platform: Platform,
               public iab: InAppBrowser,
               public settings: Settings,
               public logs: LogProvider,
               public events: Events,
               public dataProvider: DataProvider) {

  }

  init(){
      if(this.initialized) return;

      //OAuth
      this.appKey = 'b8sn92hzgcgspmo';

      if(this.platform.is('cordova')){
        this.redirectURI = 'http://localhost';
      }
      else {
        //this.redirectURI = 'https://min.mzlabs.net';
        this.redirectURI = 'http://localhost:8100';
      }

      this.filename = this.settings.getValue('dropbox_filename');

      if(this.settings.getValue('DropboxSyncOnNextLoad')){
          this.dataSync();
          this.settings.setValue('DropboxSyncOnNextLoad',false);
      }

      this.events.subscribe("InitiateDropboxSync", ()=>{
          this.dataSync().then(()=>{
            console.log("Dropbox Sync Success");
          })
          .catch(err=>{
            console.log("Error Auto Dropbox Sync: ", err);
          });
      });
  }


  async dataSync(){
    //login
    try{
      await this.checkToken();
      //load the data and see if anything new
      try{//second try cach block, seperate this from upload, in case we get error that file not exist,
          //still should make a new file
        let data = await this.downloadFile();
        //merge data with our current data
        this.logs.print(data);
        //merge data
        await this.dataProvider.mergeMultipleDocs(data);
      }
      catch(e){
        this.logs.print("Download Dropbox Error", e);
      }
      
      //backup new data
      await setTimeout(function() {
        console.log("timeout");
      }, 1000)
      await delay(2000);
      console.log("end timeout");
      await this.uploadNewFile();
      return "Backup Successfull";
    }
    catch(e){
      return e.toString();
    }
    
  }

  login(){
    this.init();
    this.logs.print("Dropbox", "Login");
    return new Promise((resolve, reject) => {
      let url = 'https://www.dropbox.com/1/oauth2/authorize?client_id=' + this.appKey + '&redirect_uri=' + this.redirectURI + '&response_type=token';
 
      let browser;
      if(this.platform.is('cordova'))
        browser = this.iab.create(url, '_blank');
      else
        browser = this.iab.create(url, '_self');

      let listener = browser.on('loadstart').subscribe((event: any) => {
   
        //Ignore the dropbox authorize screen
        if(event.url.indexOf('oauth2/authorize') > -1){
          return;
        }
        //Check the redirect uri
        if(event.url.indexOf(this.redirectURI) > -1 ){
          listener.unsubscribe();
          browser.close();
          let token = event.url.split('=')[1].split('&')[0];
          this.setAccessToken(token);
          resolve(event.url);
        } else {
          reject("Dropbox could not authenticate");
        }
      });
    });
   
  }

  uploadNewFile(){
    return new Promise((resolve, reject) => {
      var dbx = new Dropbox({ accessToken:this.accessToken });
      let data =  this.generateFile();
      this.logs.print('Geneerated, Encrypted Data');
      this.logs.print(data);
      dbx.filesUpload({
        contents: data,
        path: '/'+this.filename,
        mode:{'.tag': 'overwrite'},
        autorename: false,
        mute: true,
      }).then(res=>{
        this.logs.print("Uploaded new File");
        this.logs.print(res);
        resolve(true);
      })
      .catch(err=>{
       this.logs.print(err);  
      })
    });
  }

  
  downloadFile():Promise<any>{
    this.logs.print("In DownloadFile");
    let headers = new Headers();
     
    headers.append('Authorization', 'Bearer ' + this.accessToken);
    //headers.append('Dropbox-API-Arg', '{"path":"/minbackup.txt"}');
    let filename = '{\"path\": \"/'+this.filename+'\"}';
    this.logs.print("Save Filename", filename);
    headers.append('Dropbox-API-Arg',filename);
    headers.append('Content-Type','');

    return this.http.post('https://content.dropboxapi.com/2/files/download', 
      null, 
      new RequestOptions(
        {
            headers: headers,
            responseType: ResponseContentType.ArrayBuffer}
        ))
        .map(res => res['_body'])
        .map(res => new TextDecoder('utf-8').decode(res))
        .map(res => CryptoJS.AES.decrypt(res, this.key))
        .map(res => res.toString(CryptoJS.enc.Utf8))
        .map(res => JSON.parse(res))
        .toPromise()
        .catch(this.handleError);
  }

  extractDecryptData(res) {
    this.logs.print(res);
    if(res['_body']){
      this.logs.print('buffer');
      this.logs.print(res['_body']);
      //decode from ArrayBuffer
      let s = new TextDecoder('utf-8').decode(res['_body']);
      //decrypt
      let e =  CryptoJS.AES.decrypt(s, this.key);
      //let s =  decodeURIComponent(String.fromCharCode.apply(null, res['_body']));
      this.logs.print('String');
      this.logs.print(s);
      this.logs.print('Decrypted');
      this.logs.print(e.toString(CryptoJS.enc.Utf8));
      return e.toString(CryptoJS.enc.Utf8);

    }
    else {
      return "";
    }
  }

  handleError (error) {
    // In a real world app, you might use a remote logging infrastructure
    let  errMsg = error.message ? error.message : error.toString();
    this.logs.print(errMsg);
    return Observable.throw("Couldn't download file");
  }

  generateFile():string {
      let data = JSON.stringify(this.dataProvider.getAllDocs());
      console.log('Saving New File', this.dataProvider.getAllDocs());
      let e = CryptoJS.AES.encrypt(data, this.key);

      this.logs.print("Encrypted: ");
      this.logs.print(e.toString());
      return e.toString();
  }
 
  setAccessToken(token) {
    this.settings.setValue('dropbox_token', token);
    this.accessToken = token;
  }

  async checkToken(){
    let token = this.settings.getValue('dropbox_token');
    if(this.accessToken)
      token = this.accessToken;
    

    if(token){
      this.setAccessToken(token);
    }
    else{
      try{
        await this.login();
      }
      catch(e){
        throw new Error("Dropbox: Could Not Authenticate");
      }
          
    }
  }


}