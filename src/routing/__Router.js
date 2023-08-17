import { readdir } from 'fs/promises';
import { renderScripts, renderTemplate ,renderHead} from '../ui/index.js';
import http from 'http'
import { resolve } from 'path';
import mainLayout from './mainLayout.js';
import { tag ,html} from '../ui/index.js';
export { staticServer } from './someTestMiddleware/staticServer.js';

export default class Routing{

    //routeContent is an object that the keys are routes and the values are route handlers functions 
    routeContent={}
    route
    routesFolder
    port
    host

    constructor(config){
        if(config){
            this.routesFolder = config.routes
            this.host = config.host
            this.port = config.port
        }

        this.addPage('mainLayout', mainLayout)
    }
    startServer(host= this.host, port = this.port, callback){
        
        const app = http.createServer((req, res)=>this.requestHandler(req, res))
        port = process.env.PORT || port|| 1000
        host = host|| 'localhost';
        app.listen(port, host, ()=>{
            if(callback) callback();
            else console.log(`app is listening on ${host}:${port}/`);
                
        })
    }
    
    //callbackhandler should return an object like this : {index: (prop)=>{}, layout?:(prop)=>{}}
    all(route, callbackHandler){
        this.routeContent[route] = {...this.routeContent[route], all: callbackHandler}
        console.log('all route registerd: ', route, this.routeContent[route])
    }
    //http request methods handler functions. they could be used to make API
    get(route, callbackHandler){
        this.routeContent[route] = {...this.routeContent[route], get: callbackHandler}
        console.log('get route registerd: ', route, this.routeContent[route])
    }
    post(route, callbackHandler){
        //
        this.routeContent[route] = {...this.routeContent[route], post: callbackHandler}
        console.log('post route registerd: ', route, this.routeContent[route])
    }
    put(route, callbackHandler){
        //
        this.routeContent[route] = {...this.routeContent[route], put: callbackHandler}
        console.log('put route registerd: ', route, this.routeContent[route])
    }
    delete(route, callbackHandler){
        // 
        this.routeContent[route] = {...this.routeContent[route], del: callbackHandler}
        console.log('delete route registerd: ', route, this.routeContent[route])
    }

    //for adding middleware. the same as express
    use(callbackHandler){
        let i =0
        while(true){
            if(!this.routeContent[`middleware-${i}`]) break;
            else i++;
        }
        this.routeContent[`middleware-${i}`] = {middleware: callbackHandler}
    }

    //remove the route and its handlers
    remove(route){
        delete this.routeContent[route]
        console.log(route, 'deleted')
    }


    //for addin a custom page route that maybe the page is not in the routes folder or any other
    // the page sould export a defalut function that return the content
    //page can also return these function : layout(), error(), actions, get(), post() ...
    async addPage(route, page){
        if(page.default){
            const {default: index, ...rest} = page
            this.routeContent[route] = {...this.routeContent[route] , index ,...rest}            
        }else if(page.name == 'default'){
            this.routeContent[route] = {...this.routeContent[route] , index: page}            
        }else {
            this.routeContent[route] = {...this.routeContent[route] , ...page}            
        }
    }


    //search and registers all routes in side the dir folder
    async registerFileBasedRoutes (dir, prefix = ''){
        const dirent = await readdir(dir, {withFileTypes: true, recursive: true});
        const file = await Promise.all(dirent.map(async dirent =>{
            if(dirent.isDirectory()){
                await this.registerFileBasedRoutes(dir+'/'+ dirent.name)
            }else{
                
                const res = resolve(dir, dirent.name )
                let route = dir.slice(dir.indexOf('routes')+6)
                if(prefix) route = route + '/'+prefix
                
                if(route == '') route = '/'

                if(dirent.name == 'index.js'){
                    const exports =  await import("file://"+ res)
                    const {default: index , ...rest} = exports
                    this.routeContent[route]= Object.assign({index, ...rest}, this.routeContent[route]) 
    
                }else if(dirent.name == 'layout.js'){
                    const {default: layout , ...rest} = await import("file://"+ res)
                    this.routeContent[route]= Object.assign({layout, ...rest}, this.routeContent[route]) 
    
                }else if(dirent.name == 'error.js'){
                    const {default: error , ...rest} = await import("file://"+ res)
                    this.routeContent[route]= Object.assign({error, ...rest}, this.routeContent[route]) 
    
                }else if(dirent.name == 'api.js'){
                    this.routeContent[route]= Object.assign({ ...(await import("file://"+ res))}, this.routeContent[route]) 
    
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
    getLoadFunction(route){
        if(this.routeContent[route] && this.routeContent[route].load){
            return this.routeContent[route].load 
        }else{
            return false
        }
    }


    async getLayout(route, content, reqResObj){
        reqResObj['content'] = Routing.wrapContent(route, content)
        if(this.routeContent[route] && this.routeContent[route].layout)
            return Routing.wrapLayout(route, await this.routeContent[route].layout(reqResObj))   
        else 
            return content
    }
    // partial page requests need partial layouts
    async getPartialLayouts(route, targetLayout, content, reqResObj){
        if(route == '' ) return content
        if(route == targetLayout) return content
        if(route.slice(0, (route.lastIndexOf('/') > 0 ? route.lastIndexOf('/') : 1)) == targetLayout) return await this.getLayout(route, content, reqResObj)
        
        if(route == '/'){
            return this.getLayout(route, content, reqResObj)
        } 
        if(this.routeContent[route] && this.routeContent[route].layout){
            return await this.getPartialLayouts(route.slice(0, (route.lastIndexOf('/') > 0 ? route.lastIndexOf('/') : 1)), targetLayout, await this.getLayout(route, content, reqResObj), reqResObj)
        }else{
            return await this.getPartialLayouts(route.slice(0, (route.lastIndexOf('/') > 0 ? route.lastIndexOf('/') : 1)), targetLayout, content, reqResObj)  
        }
    }
    
    // for none partial request hole the layout hirarchi until to the base layout should be called
    async getLayouts(route, content, reqResObj){
        if(route == '' ) return content
        if(route == '/'){
            return await this.getLayout(route, content, reqResObj)
        } 
        if(this.routeContent[route] && this.routeContent[route].layout){
            return await this.getLayouts(route.slice(0, (route.lastIndexOf('/') > 0 ? route.lastIndexOf('/') : 1)), await this.getLayout(route, content, reqResObj), reqResObj)
        }else{
            return await this.getLayouts(route.slice(0, (route.lastIndexOf('/') > 0 ? route.lastIndexOf('/') : 1)), content, reqResObj)  
        }
    }

    
    getIndex(route){
        if(this.routeContent[route] && this.routeContent[route].index){
            return this.routeContent[route].index 
        }else{
            return false
        }
    }
    getError(route){
        if(route =='') return 'not found at all'
        if(this.routeContent[route]?.error){
            return this.routeContent[route].route
        }else{
            return this.getError(route.slice(0, (route.lastIndexOf('/') -1)))
        }
    }
    normalizeRoute(route){
        if (route.endsWith('/')&& route.length > 1) route = route.slice(0, route.lastIndexOf('/'))
        return route
    }
    
    // handle routing for page requests
    async pageRoutingHandler(reqResObj){

        let route = this.normalizeRoute(reqResObj.req.url)
        var match
        let entries = Object.entries(this.routeContent)

        for(let i = 0 ; i<  entries.length ; i++){
            //if the route  is a middleware
            if(entries[i][0].startsWith('middleware-')){
                //if the the middleware refuses the with false the the request does not proceed any more
                //normally the middlewares should return true
                const returned = await entries[i][1].middleware(reqResObj)
                if(!returned) return
                continue;
            }

            //if the route is route
            const {result, params} = matchRoute(entries[i][0], route)
            reqResObj.req.params = params

            if(result){
                route = this.normalizeRoute(entries[i][0])
                //call the load function
                let loadFunction = this.getLoadFunction(route)
                if(loadFunction) await loadFunction(reqResObj)

                let contentObject = this.getIndex(route)
                
                if(!contentObject) return reqResObj.res.send(this.getError(route))
                
                
                let content = renderTemplate(contentObject(reqResObj))
                let headContent = renderHead(contentObject(reqResObj))
                let scriptContent = renderScripts(contentObject(reqResObj))

                let layout
                //for partial request it returns only pages with out layouts
                if(reqResObj.req.headers['u-partial'] == 'true'){
                    const targetLayout = reqResObj.req.headers['target-layout']
                    layout =  await this.getPartialLayouts(route, targetLayout, content, reqResObj)
                    const layoutTemplate = renderTemplate(layout)
                    
                    scriptContent += renderScripts(layout)
                    headContent +=renderHead(layout)

                    const response = {
                        template: layoutTemplate,
                        headContent: headContent,
                        script: scriptContent
                    }
                    return reqResObj.res.json(response, 200)
                }

                let response

                if(content) {
                    let layoutObject = await this.getLayouts(route, content, reqResObj)
                    scriptContent += renderScripts(layoutObject)
                    headContent += renderHead(layoutObject)
                    let head = headContent + `<script>${scriptContent}</script>`

                    response = renderTemplate(this.routeContent['mainLayout'].index({head: head, body: layoutObject, ...reqResObj}))
                }else{
                    response = renderTemplate( this.getError(route).error(req.params))
                }
                reqResObj.res.send(response) 
                return
            }
        }

        let error = this.getError(route)
        reqResObj.res.send(error, 404) 
    }
    //handle routing for api requests
    async apiRoutingHandler(reqResObj){

        let route = this.normalizeRoute(reqResObj.req.url)
        var match
        let entries = Object.entries(this.routeContent)
    
        for(let i = 0 ; i<  entries.length ; i++){
            //if the route  is a middleware
            if(entries[i][0].startsWith('middleware-')){
                //if the the middleware refuses the with false the the request does not proceed any more
                //normally the middlewares should return true
                const returned = await entries[i][1].middleware(reqResObj)
                if(!returned) return
                continue;
            }
            const {result, params} = matchRoute(entries[i][0], route)
            reqResObj.req.params = params
            if(result){
                route = this.normalizeRoute(entries[i][0])
                if(reqResObj.req.method == "GET"){
                    if(this.routeContent[route].get){
                        return this.routeContent[route].get(reqResObj)
                    }
                }else if(reqResObj.req.method == "POST"){
                    //check for actions
                    const formAction = reqResObj.req.headers['u-formaction']
                    if(formAction){
                        let loadFunction = this.getLoadFunction(route)
                        if(loadFunction) await loadFunction(reqResObj)
                
                        let actionResponse =true

                        if(this.routeContent[route] && this.routeContent[route].actions && this.routeContent[route].actions[formAction]){
                            actionResponse = this.routeContent[route].actions[formAction](reqResObj)
                        }else{
                            
                            return reqResObj.res.send(renderTemplate(this.getError(route)), 404)
                        }
                        if(!actionResponse) return 
                        if(this.routeContent[route].index){
                            return reqResObj.res.send(renderTemplate(this.getIndex(route)(reqResObj)), 200) 
                        }else{
                            return reqResObj.res.send(renderTemplate(this.getError(route)),404)
                        } 
                    }else{
                        if(this.routeContent[route].post){
                            return this.routeContent[route].post(reqResObj)
                        }
                    }

            
                }else if(reqResObj.req.method == "PUT"){
                    if(this.routeContent[route].put){
                        return this.routeContent[route].put(reqResObj)
                    }
            
                }else if(reqResObj.req.method == "DELETE"){
                    if(this.routeContent[route].del){
                        return this.routeContent[route].del(reqResObj)
                    }
                }
    
                // if no handler method found
                reqResObj.res.json({'message': 'method not supported'}, 404)
                return 
            }   
        }
        reqResObj.res.setStatus(402).json({'message': '404 page not found'})
            
    }
   // checks if the request is a api requst or it is browser request
    async  requestHandler(req, res){

        
        //adds response methods 
        await parseBody(req, res)
        await parseFormData(req, res)
        addResponseFunctions(req, res)
        await parseSearchParams(req, res)

        let reqResObj = {
            req: req,
            res: res
        }
        if(req.method == 'GET' && (req.headers['u-partial'] == 'true' || req.headers['accept'].indexOf('text/html') > -1)){
            await this.pageRoutingHandler(reqResObj)
    
        }else if(req.method == 'POST' && (req.headers['u-partial'] == 'true' || req.headers['accept'].indexOf('text/html') > -1)){
            await this.pageRoutingHandler(reqResObj)
    
        }else {
            await this.apiRoutingHandler(reqResObj)
        }
    }
}


async function parseFormData(req, res){
    if (req.headers['u-formaction']) {
        req.formData = JSON.parse(req.body)
    }
}

async function parseBody(req, res){
    let body = '';
    try {
        for await (const chunk of req) {
          body += chunk;
        }
        req.body = body
    } catch (error) {
      console.error('Error parsing body:', error);
      res.send('Invalid body data', 400)
    }
}

async function parseSearchParams(req, res){
    if(req.url.indexOf("?") > -1){
        const query = new URLSearchParams(req.url.split('?')[1]);
        req.url = req.url.split('?')[0]
        const params = {};
        for (const [key, value] of query) {
          params[key] = value;
        }
        req.searchParams = {params}
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
    const params = {}
    var result = true
    
    if(!(path.indexOf('/[') > -1)){
        if(path !== route) result = false
    }else{
        path = path.startsWith('/')? path.slice(1): path
        route = route.startsWith('/')? route.slice(1): route
        
        var routeArray = route.split('/')
        var pathArray = path.split('/')
    
        for(let i=0;i<  routeArray.length; i++){
            if(pathArray[i] != routeArray[i]){
                if(/^(?!\[\.\.\.)\[(.+?)\]/g.test(pathArray[i]) && routeArray[i]){
                    pathArray[i] = pathArray[i].replace(/\[(.+?)\]/g, (match, p1)=>{
                        params[p1] = routeArray[i]
                        return match
                    })
                }else if(/\[\.\.\.(.+?)\]*\]/g.test(pathArray[i]) ){
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
    }
    
    return {result, params}
}
