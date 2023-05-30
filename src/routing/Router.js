import { readdir } from 'fs/promises';
import { renderTemplate } from '../ui/index.js';
import http from 'http'
import { readFile } from 'fs/promises';


export default class Routing{
    static routeContent={}
    static route
    static routeFolder = './src/routes'

    constructor(){
        registerFileBasedRoutes(this.routeFolder)
    }
    static addRoute(route){
        //

    }

    static async registerFileBasedRoutes (dir){
        const dirent = await readdir(dir, {withFileTypes: true, recursive: true});
        const file = await Promise.all(dirent.map(async dirent =>{
            if(dirent.isDirectory()){
                await this.registerFileBasedRoutes(dir+'/'+ dirent.name)
            }else{
                console.log('file scanned: ', dir + '/' + dirent.name)
                
                const res = resolve(dir, dirent.name )
                let route = dir.slice(dir.indexOf('routes')+6)
                if(route == '') route = '/'

                if(dirent.name == 'index.js'){
                    Routing.routeContent[route]= Object.assign({index: renderTemplate((await import("file://"+ res)).default() ) }, Routing.routeContent[route]) 
    
                }else if(dirent.name == 'layout.js'){
                    Routing.routeContent[route]= Object.assign({layout: await import("file://"+ res)}, Routing.routeContent[route]) 
    
                }else if(dirent.name == 'error.js'){
                    Routing.routeContent[route]= Object.assign({error: renderTemplate(await import("file://"+ res))}, Routing.routeContent[route]) 
    
                }
            }
        }))
        return
    }
    static getLayouts(route, content){
        console.log('getlayout at route: ', route)
        if(route == '' ) return content
        if(route == '/'){
            if(Routing.routeContent[route] && Routing.routeContent[route].layout)
                return Routing.routeContent[route].layout.default(content)  
            else 
                return content
        } 
        if(Routing.routeContent[route] && Routing.routeContent[route].layout){
            return this.getLayouts(route.slice(0, (route.lastIndexOf('/') > 0 ? route.lastIndexOf('/') : 1)),  Routing.routeContent[route].layout.default(content))
        }else{
            return this.getLayouts(route.slice(0, (route.lastIndexOf('/') > 0 ? route.lastIndexOf('/') : 1)), content)  
        }
    }

    
    static getIndex(route){
        console.log('getIndex at route: ', route)
        
        if(Routing.routeContent[route] && Routing.routeContent[route].index){
            return Routing.routeContent[route].index 
        }else{
            return false
        }
    }
    static getError(route){
        if(route =='') return 'not found at all'
        if(Routing.routeContent[route]?.error){
            return Routing.routeContent[route].route
        }else{
            return this.getError(route.slice(0, (route.lastIndexOf('/') -1)))
        }
    }
    static normalizeRoute(route){
        if (route.endsWith('/')&& route.length > 1) route = route.slice(0, route.lastIndexOf('/'))
        return route
    }
}






// for routing with out express
function routingHandler(req, res){
    let route = Routing.normalizeRoute(req.url)
    var match
    let entries = Object.entries(Routing.routeContent)

    for(let i = 0 ; i<  entries.length ; i++){
        match = matchRoute(entries[i][0], route)
        console.log('match: ', route, entries[i][0], match)
        if(match.result){
            console.log("incomming route: ", req.url)
            route = Routing.normalizeRoute(entries[i][0])
            let content = Routing.getIndex(route)
            let layout
            //for partial request it returns only pages with out layouts
            if(req.headers['u-partial'] == 'true'){
                return content? res.json({target: 'this would be implemented later', content: content}) : Routing.getError(route)
            }

            if(content) {
                layout = renderTemplate( Routing.getLayouts(route, content))
            }else{
                layout = Routing.getError(route)
            }
            res.send(layout) 
            return
        }
    }

    console.log("incomming route: ", req.url)
   
    let error = Routing.getError(route)
    res.send(error) 
}




export function startServer(host, port){
    const app = http.createServer(requestHandler)
    port = process.env.PORT || port|| 1000
    host = host|| 'localhost';
    app.listen(port, host, ()=>{
        console.log("app is listenting on host",host,"and port ", port)
    })

}






//scanning the route folder and register the routes and contents
await Routing.registerFileBasedRoutes(Routing.routeFolder)

Routing.route = Object.keys(Routing.routeContent)
console.log('routes: ', Routing.route)


async function requestHandler(req, res){
    res.json = async (data) =>{
        res.setHeader('Content-type', 'application/json')
        res.writeHead(200)
        res. end(await JSON.stringify(data))
    }
    res.send = (data)=>{
        res.setHeader('Content-type', 'text/html')
        res.writeHead(200)
        res.end(data)
    }

    if(/\.(js|css|jpg)$/.test(req.url)){
        
        console.log('statics ', req.url)
        const data  = await serveStatics(req.url)
        res.setHeader('Content-type', 'text/javascript')
        res.writeHead(200)
        res.end(data)
        return
    }

    routingHandler(req, res)
}

async function serveStatics(file){
    var res 
    var data = await readFile('./public/'+file, 'utf8' , (err, data)=>{
        if(err) {
            console.log("error: ",err)
            return
        }
        console.log('data: ', data)
        res = data
        return data
        
    })
    console.log("res", data)
    return data
}






function matchRoute(path, route){
    path = path.startsWith('/')? path.slice(1): path
    route = route.startsWith('/')? route.slice(1): route


    const params = {}
    var result = true
    var matchSection = []
    
    var routeArray = route.split('/')
    var pathArray = path.split('/')
    console.log("routArray: ", routeArray)
    console.log("pathArray: ", pathArray)

    for(let i=0;i<  routeArray.length; i++){
        console.log('matching(path - route) : ',pathArray[i],routeArray[i])
        if(pathArray[i] != routeArray[i]){
            if(/^(?!\[\.\.\.)\[(.+?)\]/g.test(pathArray[i]) && routeArray[i]){
                console.log('id matchin')
                pathArray[i] = pathArray[i].replace(/\[(.+?)\]/g, (match, p1)=>{
                    console.log('replace match', match)
                    console.log('p1', p1)
                    params[p1] = routeArray[i]
                    return match
                })
            }else if(/\[\.\.\.(.+?)\]*\]/g.test(pathArray[i]) ){
                console.log('rest matching')
                pathArray[i] = pathArray[i].replace(/\[\.\.\.(.+?)\]*\]/g, (match, p1)=>{
                    console.log('replace match', match)
                    console.log('p1', p1)
                    return match
                })
                //no need to check forther rest can be any value
                break;
            }else{
                console.log('matchin eslse')
                result = false 
                // it does not match no need to check further
                break;
            }
        }
        matchSection.push(pathArray[i])
    }
    console.log('params: ', params)
    return {result, matchSection: matchSection.join('/')}
}



//when using express
    
    // function routeRigesterHandler(req, res, route){
    //     console.log("incomming route: ", req.url)
    //     route = normalizeRoute(route)
    //     let content = Routing.getIndex(route)
    //     let layout
    //     //for partial request it returns only pages with out layouts
    //     if(req.headers['u-partial']){
    //         return content? res.send(content) : Router.getError(route)
    //     }
    
    //     if(content) {
    //         layout = renderTemplate( Routing.getLayouts(route, content))
    //     }else{
    //         layout = Routing.getError(route)
    //     }
    //     res.send(layout) 
    // }
    
    // function registerExpressRoutes(){
    //     for (let route of Routing.route){
    //         let changedRoute = route.replace(/\[(.+?)\]/g, (match, p1)=> ":"+p1)
    //         app.all(changedRoute, (req, res)=>routeRigesterHandler(req, res, route))
    //     }
        
    // }
    
    // registerExpressRoutes()
