


document.querySelector('head').innerHTML = document.querySelector('head').innerHTML + `
<style>
a[href] * {
    pointer-events: none
}    
</style>
`

async function request(url, originLayout){
    return  await fetch(url, {
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

    document.getElementById('content-'+targetLayout).innerHTML = template
    
    registerClick()

}

function registerClick(){
    document.querySelectorAll('a[href]').forEach(element=>{  
        element.addEventListener('click', handleLinkClick)
    })
}
registerClick()

        
        
        
    
    
    