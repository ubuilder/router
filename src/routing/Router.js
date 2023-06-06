import { readdir } from 'fs/promises';
import { renderScripts, renderTemplate } from '../ui/index.js';
import http from 'http'
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { tag } from '../ui/index.js';
import { staticServer } from './someTestMiddleware/staticServer.js';
export {staticServer}

export default class Routing{

    //routeContent is an object that the keys are routes and the values are route handlers functions 
    static routeContent={}
    static route
    static routesFolder
    static port
    static host

    constructor({host, port, routes, ...rest}){
        this.routesFolder = routes
        this.host = host
        this.port = port
        this.registerFileBasedRoutes(routes)
        this.startServer(host, port)
    }
    //callbackhandler should return an object like this : {index: (prop)=>{}, layout?:(prop)=>{}}
    static all(route, callbackHandler){
        this.routeContent[route] = {...this.routeContent[route], all: callbackHandler}
        console.log('all route registerd: ', route, this.routeContent[route])
    }
    //http request methods handler functions. they could be used to make API
    static get(route, callbackHandler){
        this.routeContent[route] = {...this.routeContent[route], get: callbackHandler}
        console.log('get route registerd: ', route, this.routeContent[route])
    }
    static post(route, callbackHandler){
        //
        this.routeContent[route] = {...this.routeContent[route], post: callbackHandler}
        console.log('post route registerd: ', route, this.routeContent[route])
    }
    static put(route, callbackHandler){
        //
        this.routeContent[route] = {...this.routeContent[route], put: callbackHandler}
        console.log('put route registerd: ', route, this.routeContent[route])
    }
    static delete(route, callbackHandler){
        // 
        this.routeContent[route] = {...this.routeContent[route], del: callbackHandler}
        console.log('delete route registerd: ', route, this.routeContent[route])
    }

    //for adding middleware. the same as express
    static use(callbackHandler){
        let i =0
        while(true){
            if(!this.routeContent[`middleware-${i}`]) break;
            else i++;
        }
        this.routeContent[`middleware-${i}`] = {middleware: callbackHandler}
    }

    //remove the route and its handlers
    static remove(route){
        delete this.routeContent[route]
        console.log(route, 'deleted')
    }


    //for addin a custom page route that maybe the page is not in the routes folder or any other
    // the page sould export a defalut function that return the content
    //page can also return these function : layout(), error(), actions, get(), post() ...
    static async addPage(route, page){
        if(page.default){
            const {default: index, ...rest} = page
            this.routeContent[route] = {...this.routeContent[route] , index ,...rest}            
        }else if(page.name == 'default'){
            this.routeContent[route] = {...this.routeContent[route] , index: page}            
        }else {
            this.routeContent[route] = {...this.routeContent[route] , ...page}            
        }
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
                    const exports =  await import("file://"+ res)
                    const {default: index , ...rest} = exports
                    console.log('exports: ', {index , ...rest} )
                    Routing.routeContent[route]= Object.assign({index, ...rest}, Routing.routeContent[route]) 
    
                }else if(dirent.name == 'layout.js'){
                    const {default: layout , ...rest} = await import("file://"+ res)
                    console.log('exports: ', {layout , ...rest} )

                    Routing.routeContent[route]= Object.assign({layout, ...rest}, Routing.routeContent[route]) 
    
                }else if(dirent.name == 'error.js'){
                    const {default: error , ...rest} = await import("file://"+ res)
                    console.log('exports: ', {error , ...rest} )

                    Routing.routeContent[route]= Object.assign({error, ...rest}, Routing.routeContent[route]) 
    
                }else if(dirent.name == 'api.js'){
                    Routing.routeContent[route]= Object.assign({ ...(await import("file://"+ res))}, Routing.routeContent[route]) 
    
                }
            }
        }))
        return
    }
    static wrapContent(route, content){
        return tag('span', {id: 'content-'+route}, content)
    }
    static wrapLayout(route, content){
        return tag('span', {id: 'layout-'+route}, content)
    }
    static getLayout(route, content){
        console.log('layout content: ', content)
        if(Routing.routeContent[route] && Routing.routeContent[route].layout)
            return this.wrapLayout(route, Routing.routeContent[route].layout(this.wrapContent(route, content)))   
        else 
            return content
    }
    // partial page requests need partial layouts
    static getPartialLayouts(route, targetLayout, content){
        if(route == '' ) return content
        if(route == targetLayout) return content
        if(route.slice(0, (route.lastIndexOf('/') > 0 ? route.lastIndexOf('/') : 1)) == targetLayout) return this.getLayout(route, content)
        
        if(route == '/'){
            return this.getLayout(route, content)
        } 
        if(Routing.routeContent[route] && Routing.routeContent[route].layout){
            return this.getPartialLayouts(route.slice(0, (route.lastIndexOf('/') > 0 ? route.lastIndexOf('/') : 1)), targetLayout, Routing.routeContent[route].layout(content))
        }else{
            return this.getPartialLayouts(route.slice(0, (route.lastIndexOf('/') > 0 ? route.lastIndexOf('/') : 1)), targetLayout, content)  
        }
    }

    // for none partial request hole the layout hirarchi until to the base layout should be called
    static getLayouts(route, content){
        if(route == '' ) return content
        if(route == '/'){
            return this.getLayout(route, content)
        } 
        if(Routing.routeContent[route] && Routing.routeContent[route].layout){
            return this.getLayouts(route.slice(0, (route.lastIndexOf('/') > 0 ? route.lastIndexOf('/') : 1)),  this.getLayout(route, content))
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
    static startServer(host, port){
        const app = http.createServer(requestHandler)
        port = process.env.PORT || port|| 1000
        host = host|| 'localhost';
        app.listen(port, host, ()=>{
            console.log(`app is listening on ${host}:${port}/`)
        })
    }
    
}







// handle routing for page requests
async function pageRoutingHandler(req, res){

    let route = Routing.normalizeRoute(req.url)
    var match
    let entries = Object.entries(Routing.routeContent)

    for(let i = 0 ; i<  entries.length ; i++){
        //if the route  is a middleware
        if(entries[i][0].startsWith('middleware-')){
            //if the the middleware refuses the with false the the request does not proceed any more
            //normally the middlewares should return true
            const returned = await entries[i][1].middleware(req, res)
            if(!returned) return
            continue;
        }

        //if the route is route
        const {result, params} = matchRoute(entries[i][0], route)
        req.params = params

        if(result){
            route = Routing.normalizeRoute(entries[i][0])
            let content = Routing.getIndex(route)
            if(!content) return res.send(Routing.getError(route))

            content = renderTemplate(content(req))
            let layout
            //for partial request it returns only pages with out layouts
            if(req.headers['u-partial'] == 'true'){
                const targetLayout = req.headers['target-layout']
                layout =  Routing.getPartialLayouts(route, targetLayout, content)
                const layoutTemplate = renderTemplate(layout)
                // const layoutStyle = renderStyle(layout)
                const layoutScript = renderScripts(layout)
                const response = {
                    template: layoutTemplate,
                    // style: layoutStyle,
                    script: layoutScript
                }
                return res.json(response, 200)
            }

            if(content) {
                layout = renderTemplate( Routing.getLayouts(route, content))
            }else{
                layout = renderTemplate( Routing.getError(route).error(req.params))
            }
            res.send(layout) 
            return
        }
    }

    let error = Routing.getError(route)
    res.send(error) 
}
//handle routing for api requests
async function apiRoutingHandler(req, res){

    let route = Routing.normalizeRoute(req.url)
    var match
    let entries = Object.entries(Routing.routeContent)

    for(let i = 0 ; i<  entries.length ; i++){
        //if the route  is a middleware
        if(entries[i][0].startsWith('middleware-')){
            //if the the middleware refuses the with false the the request does not proceed any more
            //normally the middlewares should return true
            const returned = await entries[i][1].middleware(req, res)
            if(!returned) return
            continue;
        }
        const {result, params} = matchRoute(entries[i][0], route)
        req.params = params
        if(match.result){
            route = Routing.normalizeRoute(entries[i][0])
            if(req.method == "GET"){
                if(Routing.routeContent[route].get){
                    return Routing.routeContent[route].get(req, res)
                }
            }else if(req.method == "POST"){
                if(Routing.routeContent[route].post){
                    return Routing.routeContent[route].post(req, res)
                }
        
            }else if(req.method == "PUT"){
                if(Routing.routeContent[route].put){
                    return Routing.routeContent[route].put(req, res)
                }
        
            }else if(req.method == "DELETE"){
                if(Routing.routeContent[route].del){
                    return Routing.routeContent[route].del(req, res)
                }
            }

            // if no handler method found
            res.json({'message': 'method not supported'}, 404)

            return 
        }   
    }
        
    
}
// checks if the request is a api requst or it is browser request
//adds some method to request
async function requestHandler(req, res){
    //adds response methods 
    addResponseFunctions(req, res)
    if(req.method == 'GET' && (req.headers['u-partial'] == 'true' || req.headers['accept'].indexOf('text/html') > -1)){
        pageRoutingHandler(req, res)

    }else if(req.method == 'POST' && (req.headers['u-partial'] == 'true' || req.headers['accept'].indexOf('text/html') > -1)){
        pageRoutingHandler(req, res)

    }else {
        console.log('apit routind')
        apiRoutingHandler(req, res)
    }
}

// some fuction for sending respons to browser
function addResponseFunctions(req, res){
    res.json = async (data, statusCode = 200) =>{
        res.setHeader('Content-type', 'application/json')
        res.writeHead(statusCode)
        res. end(await JSON.stringify(data))
    }
    res.send = (data, statusCode = 200)=>{
        res.setHeader('Content-type', 'text/html')
        res.writeHead(statusCode)
        res.end(data)
    }
    res.setStatus = (code) =>{
        res.setHeader('Content-type', 'application/json')
        res.writeHead(code)
        return {json : async (data)=>{
            res.end( await JSON.stringify(data))
        }}
    }

}

// checks if the requsted route is valid
function matchRoute(path, route){
    path = path.startsWith('/')? path.slice(1): path
    route = route.startsWith('/')? route.slice(1): route

    const params = {}
    var result = true

    var routeArray = route.split('/')
    var pathArray = path.split('/')

    for(let i=0;i<  routeArray.length; i++){
        console.log('matching(path - route) : ',pathArray[i],routeArray[i])
        if(pathArray[i] != routeArray[i]){
            if(/^(?!\[\.\.\.)\[(.+?)\]/g.test(pathArray[i]) && routeArray[i]){
                pathArray[i] = pathArray[i].replace(/\[(.+?)\]/g, (match, p1)=>{
                    params[p1] = routeArray[i]
                    return match
                })
            }else if(/\[\.\.\.(.+?)\]*\]/g.test(pathArray[i]) ){
                console.log('rest matching')
                pathArray[i] = pathArray[i].replace(/\[\.\.\.(.+?)\]*\]/g, (match, p1)=>{
                    return match
                })
                //no need to check forther rest can be any value
                break;
            }else{
                result = false 
                // it does not match no need to check further
                break;
            }
        }
    }
    console.log('params: ', params)
    return {result, params}
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
