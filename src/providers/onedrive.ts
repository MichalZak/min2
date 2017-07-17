import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, ResponseContentType  } from '@angular/http';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Platform, Events } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { DataProvider } from './data-provider';
import { LogProvider } from './logs'
import { Settings } from './settings';
import CryptoJS from 'crypto-js';
import { TextDecoder } from 'text-encoding-shim';


import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import {delay} from "../utils";

@Injectable()
export class OnedriveProvider {

  static RECEIVED_CODE:string = "OnedriveReceivedCode";
  static AUTHENTICATION_INITIATED:string = "Onedrive_AuthInitiated";

  initiated:boolean = false;
  accessToken: any;// = "d-e6T61aqsoAAAAAAAAgekf6inrXDPP0QuOIYELJ03rOniXWAQxgMsEJgyIfC8q0";
  filename:string;
  folderHistory: any = [];
  appKey: any;
  appSecret:any;
  redirectURI: any;

  //encrption
  key:string  = "23dsff@#$sdffwdsf234234234";
  //https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=6731de76-14a6-49ae-97bc-6eba6914391e&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%2Fmyapp%2F&response_mode=query&scope=openid%20offline_access%20https%3A%2F%2Fgraph.microsoft.com%2Fmail.read&state=12345


  constructor( public http: Http,
               public platform: Platform,
               public iab: InAppBrowser,
               public settings: Settings,
               public logs: LogProvider,
               public events: Events,
               public dataProvider: DataProvider) {

    console.log("ONEDRIVE PROVIDER INITIATED");
 
  }

  init(){
     if(this.initiated)
        return true;


      if(this.platform.is('cordova')){
          console.log("Working with cordova")
          this.redirectURI = 'http://localhost';
      }
      else {
          //this.redirectURI = 'https://min.mzlabs.net';
          this.redirectURI = "http://localhost:8100"
      }   


      this.filename = this.settings.getValue('onedrive_filename');

      //OAuth
      this.appKey = 'eae154a4-7df8-478a-b2e8-c971c1930a73';
      this.appSecret = 'BQppR7km6xFfmFONpphoq5M';
  


      console.log("Are we authenticating with ONEDRIVE?");
      if(this.settings.getValue(OnedriveProvider.RECEIVED_CODE)){
          try{
            let code = this.settings.getValue(OnedriveProvider.RECEIVED_CODE)
            this.settings.setValue(OnedriveProvider.RECEIVED_CODE,false);
            this.settings.setValue(OnedriveProvider.AUTHENTICATION_INITIATED, true)
            console.log("Yes we are using code to get tokens");
            this.getToken(code).then(tokens=>{
              console.log("We got tokens: ", tokens);
            })
          
          //this.dataSync();
          
  
        }
        catch(err){
          this.logs.print("Error authenticating to onedrive", err);
        }
      }



      this.events.subscribe("InitiateOnedriveSync", ()=>{
        this.dataSync().then(()=>{
          console.log("Onedrive Sync Success");
        })
        .catch(err=>{
          console.log("Error Auto Onedrive Sync: ", err);
        });
     });

    this.initiated = true;

  }



  /*
  getToken(code: string){

    this.init();//make sure we have all our needed values

    this.logs.print("Onedrive", "Login");
    return new Promise((resolve, reject) => {

      let url = "assets/getOnedriveToken.html?"
            +"client_id="+this.appKey
            +"&redirect_url="+this.redirectURI
            +"&client_secret="+this.appSecret
            +"&code="+code
            +"&grant_type=authorization_code";

      let browser;
      if(this.platform.is('cordova'))
        browser = this.iab.create(url, '_blank');
      else
        browser = this.iab.create(url, '_self');

      browser.on('loadstart').subscribe((event: any) => {
       console.log("GetToken Browser started");
        
      });
    });
   
  }*/



  getToken(code: string){
        this.logs.print("Requesting onedrive tokens");
        let headers = new Headers();
         
        //headers.append('Authorization', 'Bearer ' + this.accessToken);
        //headers.append('Dropbox-API-Arg', '{"path":"/minbackup.txt"}');
        //let filename = '{\"path\": \"/'+this.filename+'\"}';
        //this.logs.print("Save Filename", filename);
        //headers.append('Dropbox-API-Arg',filename);
        headers.append('Content-Type','application/x-www-form-urlencoded');
        let postParams = {
      
            client_id:this.appKey,
            redirect_uri:this.redirectURI,
            client_secret: this.appSecret,
            code: code,
            grant_type:'authorization_code'
        }
        return this.http.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', 
          postParams, 
          new RequestOptions(
            {
                headers: headers}
            ))
            .map(res => {
              console.log("Got result: ", res);
              return res['_body'];
            })
            .map(res => new TextDecoder('utf-8').decode(res))
            //.map(res => CryptoJS.AES.decrypt(res, this.key))
            //.map(res => res.toString(CryptoJS.enc.Utf8))
            //.map(res => JSON.parse(res))
            .toPromise()
            .catch(this.handleError);
  }
          
  

  async dataSync(){
    this.init();
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
        this.logs.print("Download Onedrive Error", e);
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
    this.settings.setValue(OnedriveProvider.AUTHENTICATION_INITIATED, false);
    this.logs.print("Onedrive", "Login");
    return new Promise((resolve, reject) => {
      let url = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id="+
            this.appKey +
            "&response_type=code"+
            "&redirect_uri="+this.redirectURI+
            "&response_mode=query"+
            "&scope=files.readwrite";
      let browser;
      if(this.platform.is('cordova'))
        browser = this.iab.create(url, '_blank');
      else
        browser = this.iab.create(url, '_self');

    });
   
  }

  uploadNewFile(){
    return new Promise((resolve, reject) => {
      /*var dbx = new Dropbox({ accessToken:this.accessToken });
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
      */
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
    console.log(errMsg);
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
    let token = this.settings.getValue('onedrive_token');
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

  /*
  getToken(code: string){
    this.logs.print("Onedrive", "GET TOKEN");
    return new Promise((resolve, reject) => {
      let url = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
      
      let postParams = {
      
            client_id:this.appKey,
            redirect_uri:this.redirectURI,
            client_secret: this.appSecret,
            code: code,
            grant_type:'authorization_code'
      }

      let formHtml:string = '';
      for(let key in postParams){
            formHtml+='<input type="hidden" value="'+postParams[key]+'" id="'+key+'" name="'+key+'"/>';
      }

      let payScript = "var form = document.getElementById('onedrivetoken'); ";
      payScript += "form.innerHTML = '" + formHtml + "';";
      payScript += "form.action = '" + url + "';";
      payScript += "form.method = 'POST';" ;
      payScript += "form.submit();" ;
      
      let browser;
      if(this.platform.is('cordova'))
        browser = this.iab.create("getOnedriveToken.html", '_blank');
      else
        browser = this.iab.create("getOnedriveToken.html", '_self');
  

      browser.show();
      browser.on("loadstart")
       .subscribe(
          event => {
            console.log("loadstop -->",event);
            if(event.url.indexOf("some error url") > -1){
               browser.close();
             
            }
          },
          err => {
            console.log("InAppBrowser loadstart Event Error: " + err);
       });
    
      browser.on("loadstop")
       .subscribe(
           event => {
              //here we call executeScript method of inappbrowser and pass object 
              //with attribute code and value script string which will be executed in the inappbrowser
              browser.executeScript({
                  code:payScript
               });
           console.log("loadstart -->",event);
           },
       err => {
          console.log("InAppBrowser loadstop Event Error: " + err);
       });

      browser.on("exit")
        .subscribe(
          event =>{
            console.log("exit -->",event);
          },
          err => {
           console.log("InAppBrowser loadstart Event Error: " + err);
        });
      
    });
   
  }
  */

}