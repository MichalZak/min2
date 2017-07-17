import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OnedrivePage } from './onedrive';

@NgModule({
  declarations: [
    OnedrivePage,
  ],
  imports: [
    IonicPageModule.forChild(OnedrivePage),
  ],
  exports: [
    OnedrivePage
  ]
})
export class OnedrivePageModule {}
