import * as moment from 'moment';

export class Doc {
    public _id?:string;
    public _rev?:string;
    public _deleted?:boolean;
    public type?:string; //this is to distinguish different doc types

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }

}

export class Result {
    success?: boolean;
    data?: any;
    errors?:Array<Message>;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class Message {
    message:string;
    code:string;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class Note extends Doc {

    title?: string;
    note?: string;
    date?: string;
    priority?: number;

    constructor(values: Object = {}) {
        super();
        Object.assign(this, values);
    }

}

export class Day {
    day?: number = 0;
    books?: number = 0;
    tracks?: number = 0;
    mags?:number = 0;

    placements?: number = 0;

    videos?: number = 0;
    hours?: number = 0;
    rvs?: number = 0;

    returns?: Student[] = new Array<Student>();
    students?: Student[] = new Array<Student>();

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
    static checkIfHasActivity(day:Day):boolean{
        let x = day.books+day.hours+day.mags+day.placements+day.rvs+day.tracks+day.videos;
        return x > 0;
    }
}

export class Student {
    studentId?: string;
    name?: string;
}

export class Month extends Doc {
    days?: Day[];
    studentSum?: number;
    students?: Student[];

    static findDay(month:Month, date:number):Day{
        if (month.days == null){
            month.days = new Array<Day>();
            return new Day({day: date});
        }
        let day:Day;
        month.days.forEach(d=>{
            if(d.day == date) 
                day = d; 
        })

        if(!day)
            return new Day({day: date});
        return day;
    
     }

     static printDate(date:number, month:Month):string{
         let d:string;
        if(date < 10)
            d= '0'+date;
        else
            d=''+date;
         return moment(month._id+d,'YYYYMMDD' ).format('dddd, Do');
     }

     static totals(month:Month):any{
         if(month.days == null) month.days = new Array<Day>();
         return month.days.reduce((acc:number, day)=>{
             acc['placements'] += day.placements;
             acc['videos'] += day.videos;
             acc['hours'] += day.hours;
             acc['rvs'] += day.rvs;

             return acc;
         }, {placements:0, videos:0, hours:0, rvs:0});
     }

     static printTotalsShort(month:Month):string {
         let totals = Month.totals(month);
         return "Plc: "+totals.placements+ " Vid: "+totals.videos+" Hrs: "+totals.hours+" Rvs: "+totals.rvs;

     }

}

export class Call extends Doc {
    name?: string;
    address?: string;
    note?: string;
    date?: string;
    priority?: number;
    sticky?: boolean; //use bonfire to stick on top
    callType?: string;
    visits?: Visit[];

    constructor(values: Object = {}) {
        super();
        Object.assign(this, values);
    }    
}

export class Placement extends Doc {
    name?:string;
    type?:string;
    shortName?:string;
    pubType?: string;
    category?:string;
    fav?:boolean;
    image?:string;
    language?:string;
    priority?:number;

    //for other purposes properties
    modified: string;
    language_short: string;
    categories:any;

    getImage(){
        if(this.image)
        {
            if(this.pubType === 'video')
                return "assets/img/publications/"+this.image;
            else
                return "assets/img/publications/"+ this.language +"/"+this.image;
        }
        return "assets/img/publications/default_E_md.jpg"
        
    }
    getPriority():number{
        if(this.priority)
            return this.priority;
        return 0;
    }

    
}

export class Visit {
    public id?:string;
    public date?:string;
    public note?:string;
    public placements?: Placement[];
    
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}



export class Settings extends Doc {

    public meta?:string;

    constructor(values: Object = {}) {
        super();
        Object.assign(this, values);
    }


}





export class User extends Doc {
    public username?: string;
    public password?: string;
    public email?:string;
    public header?:string;

    constructor(values: Object = {}) {
        super();
        Object.assign(this, values);
    }
}
