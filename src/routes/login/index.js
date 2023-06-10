import {tag} from '../../ui/index.js'

export const actions = {
    default: (req, res)=>{
        console.log('defalt actions callled')
        req.loggedIn = true
        return true
    },
    register: (req, res)=>{
        console.log('register actions callled')
        res.setStatus(200).json({message: 'ok'})
        return false

    }
}

export default function(req){
    
    return tag('form', {method: 'post', action: '/login?action=registe'}, [
        req.loggedIn? tag('div', {}, 'logged in'): '',
        tag('label', { for: 'username' }, 'Username: '),
        tag('input', { type: 'text', id: 'username', name: 'username' }),
      
        tag('br'),
      
        tag('label', { for: 'password' }, 'Password: '),
        tag('input', { type: 'password', id: 'password', name: 'password' }),
      
        tag('br'),
      
        tag('input', { type: 'submit', value: 'Submit' })
      ]);
}