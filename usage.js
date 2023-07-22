import { Router } from "./index.js";

const db = Router({dev: true })


// db.addStatic({path: './src', prefix: '/source'});
// db.addStatic({path: '../cms', prefix: '/cms'});

db.addLayout('/',  {
    load(req, methods) {

        req.locals.b = {a: 3}

        return {}
    },
})

db.addPage('/about', {
    page: 'About us html..'
})

db.addPage('/', {
    load(req, {}) {
        return {
            ...req.locals,
            a: 2
        }
    },
    actions: {
        upload(req) {
            console.log('upload', req)
        }
    },
    page() {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>
        <body>
            <form action="?upload" enctype="multipart/form-data" method="POST">
                <input type="file" name="file" id="3">
                <input type="text" name="name" id="4">
                <button>Submit</button>
            </form>
        </body>
        </html>`
    }
})

db.addPage('/upload', {
    load(req, {fail}) {

        console.log(req)

        // fail({message: 'Failed'})
    },
    
})
// db.startServer(3002)

db.build('./build')
