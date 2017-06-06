import { Component } from '@angular/core';

import { Tab1Root } from '../';
import { Tab2Root } from '../';
import { Tab3Root } from '../';
import { Tab4Root } from '../';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  tab1Root: any = Tab1Root;
  tab2Root: any = Tab2Root;
  tab3Root: any = Tab3Root;
  tab4Root: any = Tab4Root;

  tab1Title = "Tab1";
  tab2Title = "Tab2";
  tab3Title = "Tab3";

  constructor() {

  }
}
