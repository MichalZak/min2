


export function generateId(prefix:string=''):string{
    return prefix+"/"+generateUUID();
}


export function saveIntoArray(item:Object, ary:Array<any>, idKey:string='_id'):Array<any>{
  var i = getIndexById(item[idKey],ary,idKey);
      if(i== -1)
        i=ary.length;
      return [  ...ary.slice(0, i),
                Object.assign({},item),
                ...ary.slice(i + 1) ]
}

export function getIndexById(id:string, ary:any, idKey:string = '_id'):number{
   for(var i = 0; i < ary.length; i++){
        if(id === ary[i][idKey])
          return i;
      }

      //if we don't have a match return null
      return -1;
}


let typeCache: { [label: string]: boolean } = {};
export function type<T>(label: T | ''): T {
  if (typeCache[<string>label]) {
    throw new Error(`Action type "${label}" is not unqiue"`);
  }

  typeCache[<string>label] = true;

  return <T>label;
}

/**
 * This is a simple generattor that will have date timestamp plush random numbers
 */
export function generateUUID():string{
    var d = Date.now();

    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

export function generateShortUUID():string{
    var d = Date.now();

    var uuid = 'xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}