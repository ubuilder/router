import Router, {staticServer} from './src/routing/Router.js'
import { logger } from './src/routing/someTestMiddleware/logger.js';
// import { staticServer } from './src/routing/someTestMiddleware/staticServer.js';
import * as homePage from './src/routes/index.js'

//middle ware
Router.use(logger)
Router.use(staticServer('./public'))

//route handlers for api call
Router.get('/employee', (req, res)=>{res.send('success', 200 );console.log('get employee')})
Router.post('/employee', (req, res)=>{res.send('success', 201);console.log('post employee')})
Router.put('/employee',  (req, res)=>{res.send('success', 203);console.log('put employee')})
Router.delete('/employee', (req, res)=>{res.send('success', 200);console.log('delete employee')})
Router.all('/employee', (req, res)=>{res.send('success', 200);console.log('all method employee')})

//adding page. this works the same as the page registered through file routes
Router.addPage('/homePage', homePage)

//remove route
Router.remove('/employee')

//register all the routes at the given folder
await Router.registerFileBasedRoutes('./src/routes')

const post = 1000
Router.startServer('localhost', post)

console.log("all routes", Router.routeContent)

