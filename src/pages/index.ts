import { TabsPage } from './tabs/tabs';
import { AboutPage } from './about/about';


//Calls
import { CallDetailPage } from './calls/call-detail';
import { CallListPage } from './calls/call-list';
import { CallVisitPage } from './calls/call-visit';
import { VisitPlacementsPage } from './calls/visit-placements';
import { PlacementsComponentComponent} from './calls/componenets/placements-component';


//Notes
import { NoteDetailPage } from './notes/note-detail';
import { NoteListPage } from './notes/note-list';

//Time
import { TimeMonthPage } from './time/time-month';
import { TimeDayPage } from './time/time-day';
import { TimeYearPage } from './time/time-year';

export const MainPage = TabsPage;

// The initial root pages for our tabs (remove if not using tabs)
export const Tab1Root = TimeMonthPage;
export const Tab2Root = CallListPage;
export const Tab3Root = NoteListPage;
export const Tab4Root = AboutPage;


export {
  TabsPage,
  AboutPage,

  //Calls
  CallListPage,
  CallDetailPage,
  CallVisitPage,
  VisitPlacementsPage,
  PlacementsComponentComponent,

  //Notes
  NoteListPage,
  NoteDetailPage,

  //Time
  TimeMonthPage,
  TimeDayPage,
  TimeYearPage,



}



export function GetPages() {
  return [
    TabsPage,
    AboutPage,


    //Calls
    CallListPage,
    CallDetailPage,
    CallVisitPage,
    VisitPlacementsPage,
    PlacementsComponentComponent,

    //Notes
    NoteListPage,
    NoteDetailPage,

    //Time
    TimeMonthPage,
    TimeDayPage,
    TimeYearPage,


  ];
}