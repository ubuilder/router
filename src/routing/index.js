


document.querySelector('head').innerHTML = document.querySelector('head').innerHTML + `
<style>
a[href] * {
    pointer-events: none
}    
</style>
`

async function request(url, body){
    return  await fetch(url, {
        method: 'get',
        headers: {
            'u-partial': "true"
        }    
    })    
}    

const handleLinkClick = async (event)=>{
    event.preventDefault()
    console.log('link clicked')
    const url = new URL("https://www.abc.com/"+event.target.getAttribute('href'))

    let route = event.target.getAttribute('href')
    let userSpecifiedTargetId = url.searchParams.get('for')
    let autoSpecifiedTargetId = 


    
    let res = await request(route)
    if(!res.ok) {
        // handle error
    }
    let data = await res.json()
    if(userSpecifiedTargetId){
        document.getElementById(userSpecifiedTargetId).innerHTML = JSON.stringify(data)
        registerClick()
    }else{

        
    }


    if(targetId){
       
        if(res.ok){
            let data = await res.json()
            
                
        }    
    }
}

function registerClick(){
    document.querySelectorAll('a[href]').forEach(element=>{  
        element.addEventListener('click', handleLinkClick)
    })
}
registerClick()

        
        
        
    
    
    