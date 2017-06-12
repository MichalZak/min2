import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DropboxPage } from './dropbox';

@NgModule({
  declarations: [
    DropboxPage,
  ],
  imports: [
    IonicPageModule.forChild(DropboxPage),
  ],
  exports: [
    DropboxPage
  ]
})
export class DropboxPageModule {}
