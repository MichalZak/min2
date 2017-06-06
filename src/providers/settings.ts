import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage';



@Injectable()
export class Settings {


  private SETTINGS_KEY: string = '_setting_min';

  settings: any;

  _defaults: any;

  constructor(public storage: Storage, defaults: any) {
    console.log("Setting Defaults: "+JSON.stringify(defaults));
    this._defaults = defaults;
  }

  load() {
    return this.storage.get(this.SETTINGS_KEY).then((value) => {
      if(value) {
        this.settings = value;
        this._mergeDefaults(this._defaults);
      } else {
        return this.setAll(this._defaults).then((val) => {
          this.settings = val;
        })
      }
    });
  }

  _mergeDefaults(defaults: any) {
    for(let k in defaults) {
      if(!(k in this.settings)) {
        this.settings[k] = defaults[k];
      }
    }
    return this.setAll(this.settings);
  }

  merge(settings: any) {
    for(let k in settings) {
      this.settings[k] = settings[k];
    }
    return this.save();
  }

  setValue(key: string, value: any) {
    this.settings[key] = value;
    //this.setAll(this.settings);
    return this.storage.set(this.SETTINGS_KEY, this.settings);
  }

  setAll(value: any) {
    return this.storage.set(this.SETTINGS_KEY, value);
  }

  getValue(key: string) {
    console.log("Settings -> GET Value: "+key+ "::"+this.settings[key]);
    //return this.storage.get(key);
    return this.settings[key];
  }

  getAll(){
    return this.settings;
  }

  save() {
    return this.setAll(this.settings);
  }

  get allSettings() {
    return this.settings;
  }
}
