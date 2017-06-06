

export function getConfig(){
 //local   
 
    return {
       test:'test',
       database_properties: "https://couch.mzlabs.net/min_prop",
       //database_user: "localhost:3035", //don't include http
       //database_user_protocol: "http",
       //web_url: "http://localhost:3035"
    }

 //remote  
 /* 
  return {
       WebUrl: "http://min.mzlabs.net",
       database_name: "min.mzlabs.net/min",
       database_properties: "https://couch.mzlabs.net/min_prop" 
    }
  */
}

