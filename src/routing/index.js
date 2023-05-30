
    
        
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
        console.log('link clicked')
    
        let currentPath = window.location.pathname.split('/')
        let newPath = event.target.getAttribute('href').split('/')
        let targetId = 'body'
        
        for (let i = 0 ; i < Math.min(currentPath.length, newPath.length); i++ ){
            if(path[i] !== p[i]){
                targetId = p[i==0? 0:(i-1)]
                break;
            }
        }
        
        console.log('targetId', targetId)
        if(targetId){
            targetId = targetId.trim()
            event.preventDefault()
            const route = event.target.getAttribute('href')
            let res = await request(route)
            if(res.ok){
                let data = await res.json()
                console.log('targetid: ', targetId)
                document.getElementById(targetId).innerHTML = data
                handleLinkClick()      
            }    
        }
    }
    
    
    document.querySelectorAll('a[href]').forEach(element=>{  
        element.addEventListener('click', handleLinkClick)
    })
    


