document.querySelector('head').innerHTML = document.querySelector('head').innerHTML + `
<style>
a[href] * {
    pointer-events: none
}    
</style>
`
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

    let res = await request(route, targetLayout)
    handleRequestedData(res, targetLayout)
}
const handleRequestedData = async(res, targetLayout) =>{
    if(!res.ok) {
        // handle error
        return document.getElementById('content-'+targetLayout).innerHTML = res.error
    }
    let {template, style, script} = await res.json()

    // template 
    document.getElementById('content-'+targetLayout).innerHTML = template
    
    //style
    const isStyle = document.getElementById( 'style-'+targetLayout)
    if(isStyle){
        isStyle.innerHTML = style
    }else{
        let head = document.getElementsByTagName('head')[0]
        let css = document.createElement('style')
        css.id = "style-"+targetLayout
        css.innerHTML = style
        head.appendChild(css)
    }
    
    //javascript
    const isScript = document.getElementById( 'script-'+targetLayout)
    if(isScript){
        isScript.innerHTML = style
    }else{
        let body = document.getElementsByTagName('body')[0]
        let js = document.createElement('script')
        js.id = "script-"+targetLayout
        js.innerHTML = style
        body.appendChild(js)
    }    
    
    registerClick()
}

function registerClick(){
    document.querySelectorAll('a[href]').forEach(element=>{  
        element.addEventListener('click', handleLinkClick)
    })
}
registerClick()

        
        
        
    
    
    