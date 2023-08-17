import {tag} from '../../ui/index.js'

export const actions = {
    //renders the page
    default: ({req, res})=>{
        //get form data
        const formData = req.formData
        if(formData.username =='admin' && formData.password =='123'){
            //passes the data to page
            req.loggedIn = true
        }
        //when the return is true the page is rendered
        return true 
    },

    //returns a json response 
    register: ({req, res})=>{
        const formData = req.formData
        if(formData.username =='admin' && formData.password =='123'){
            res.setStatus(200).json({message: 'ok'})
        }else{
            res.setStatus(200).json({message: 'unauthorized'})
        }
        
        //when the return is false the response should be sent as json mannualy
        return false
    },
}

export default function({req}){
    if(req.loggedIn){
        return  tag('div', {}, 
        [
            tag('h1', {}, 'wellcome you are logged in'),
            tag('a', {href: '/login'}, "back")
        ]
        )
    }else{
        return tag('form', {htmlHead: '<title>login</title>', method: 'post', action: '/login?action=register'}, [
            
            tag('label', { for: 'username' }, 'Username: '),
            tag('input', { type: 'text', id: 'username', name: 'username', placeholder: 'admin' }),
            
            tag('br'),
            
            tag('label', { for: 'password' }, 'Password: 123'),
            tag('input', { type: 'password', id: 'password', name: 'password' }),
            
            tag('br'),
            
            tag('input', { type: 'submit', value: 'Submit' })
        ]);
    }
}