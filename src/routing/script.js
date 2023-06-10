document.querySelector('head').innerHTML = document.querySelector('head').innerHTML + `
<style>
a[href] * {
    pointer-events: none
}    
</style>
`


function registerClick(){
    document.querySelectorAll('a[href]').forEach(element=>{  
        element.addEventListener('click', handleLinkClick)
    })
}

function registerFormAction(){
    console.log('forms', document.forms)
    Array.from(document.forms).map(form =>{
        form.addEventListener('submit', handleFormAction)
    })
}


function locationHandler(url){
    console.log('location changes to : ', url)
    console.log( window)
    window.history.pushState("object or string", "Title", window.location.origin+url);
}

async function request(url, originLayout){
    if(url.startsWith('.')) url = url.slice(1)
    locationHandler(url)
    return  await fetch(window.location.origin+url, {
        method: 'get',
        headers: {
            "target-layout": `${originLayout}`,
            'u-partial': "true",
        }    
    })    
}    

function findTargetLayout(route){
    console.log("route; ", route)
    if(route.startsWith('.')) 
        route = route.slice(1)
    if(route.lastIndexOf('?') > -1)
        route = route.slice(0, route.lastIndexOf('?'))
    if(route == '/' || route == '' || route == null)
        return "/"
    if(route.endsWith('/') && route.length > 1)
        route = route.slice(0, route.length -1)

    route = route.slice(0, route.lastIndexOf('/') == 0? 1 : route.lastIndexOf('/') )
    console.log('finding element: ', 'content-'+route)
    const targetElement = document.getElementById('content-'+route)
    if(targetElement)
        return route
    return findTargetLayout(route)
}
const handleLinkClick = async (event)=>{
    event.preventDefault()
    console.log('link clicked')
    const url = new URL("https://www.abc.com/"+event.target.getAttribute('href'))
    
    let route = event.target.getAttribute('href')
    let userSpecifiedTargetLayout = url.searchParams.get('for')
    let autoSpecifiedTargetLayout = findTargetLayout(route)
    
    let targetLayout = userSpecifiedTargetLayout? userSpecifiedTargetLayout: autoSpecifiedTargetLayout
    console.log('target layout requested: ', targetLayout)

    await handleRequestedData(route, targetLayout)
}
const handleRequestedData = async(route, targetLayout) =>{
    await request(route, targetLayout)
    .then(res =>{
        if(res.ok) {
            return res.json()
        }else{
            throw new Error('Response was not ok')
        }
    })
    .then(({template, headContent, script}) =>{
        // template 
        document.getElementById('content-'+targetLayout).innerHTML = template;
        //style
        const head = document.getElementsByTagName('head')[0]
        head.innerHTML = head.innerHTML + headContent
        
        console.log('heml head: ', headContent)
        console.log('script: ', script)
        
        //javascript
        const isScript = document.getElementById( 'script-'+targetLayout)
        if(isScript){
            isScript.innerHTML = script
        }else{
            let body = document.getElementsByTagName('body')[0]
            let js = document.createElement('script')
            js.id = "script-"+targetLayout
            js.innerHTML = script
            body.appendChild(js)
        }  

    })
    .catch( error =>{
        console.log('Error: ', error)
        return document.getElementById('content-'+targetLayout).innerHTML = error
    })
    registerClick()
    registerFormAction()
}


async function handleFormAction(event){
    event.preventDefault()
    const route = event.target.getAttribute('action')
    const targetId = findTargetLayout(route)
    if(route.startsWith('.')) route = route.slice(1)
    const url = new URL("https://www.abc.com/"+route)
    let formAction = url.searchParams.get('action')? url.searchParams.get("action") : 'default'
    const formData =  new FormData(event.target);
    const formEntries = Object.fromEntries(formData)
    const formEntriesJson = JSON.stringify(formEntries)
    fetch(window.location.origin+route, {
        method: 'POST',
        body: formEntriesJson,
        headers: {
            'u-formaction': formAction,
            'Content-Type': 'application/json',
        } 
    }).then(response => {
        if (response.ok) {
             return response.text();
        } else {
            throw new Error('Network response was not ok');
        }
    }).then(data => {
        document.getElementById('content-'+targetId).innerHTML = data
        registerFormAction()
    }).catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        document.getElementById('content-'+targetId).innerHTML = error
    });
}


registerClick()
registerFormAction()
