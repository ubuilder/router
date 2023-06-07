import Router, {staticServer} from './src/routing/Router.js'
import { logger } from './src/routing/someTestMiddleware/logger.js';
// import { staticServer } from './src/routing/someTestMiddleware/staticServer.js';
import * as homePage from './src/routes/index.js'
const app = new Router()


//middleware
app.use(logger)
app.use(staticServer('./public'))

//route handlers for api call
// app.get('/employee', (req, res)=>{res.send('success', 200 );console.log('get employee')})
// app.post('/employee', (req, res)=>{res.send('success', 201);console.log('post employee')})
// app.put('/employee',  (req, res)=>{res.send('success', 203);console.log('put employee')})
// app.delete('/employee', (req, res)=>{res.send('success', 200);console.log('delete employee')})
// app.all('/employee', (req, res)=>{res.send('success', 200);console.log('all method employee')})

//adding page. this works the same as the page registered through file routes
app.addPage('/homePage', homePage)

//remove route
app.remove('/employee')

//register all the routes at the given folder
await app.registerFileBasedRoutes('./src/routes')

const port = 1000
await app.startServer('localhost', port)

// console.log("all routes", app.routeContent)
