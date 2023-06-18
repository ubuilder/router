import tag from '@ulibs/Router'


export const actions = {
    default: ({req})=>{
        //process form data
        const formData = req.formData
        //return true to pass the data to page and render the page 
        return true
    },
    register: ({req, res})=>{
        //process form data
        const formData = req.formData

        res.redirect('/login')
        //and then return false
        return false
    },
    modify: ({req})=>{
        //process form data
        const formData = req.formData

        res.setStatus(200).json({message: 'user modified'})
        //and then return false
        return false
    }
}

//usage default
export default function({req}){
        //this form calls the default action
    return tag('form', {method: 'post', action: '/auth'},
    [
        tag('input', { name: 'name', type: 'text'}),
        tag('input', { type: 'submit', onClick: "console.log(hellow)"}),
    ])
}
//usage named actions
export default function({req}){
        //this form calls the action called register in auth route and redirects
    return tag('form', {method: 'post', action: '/auth?action=register'},
    [
        tag('input', { name: 'name', type: 'text'}),
        tag('input', { type: 'submit'}),
    ])
}
//usage named actions
export default function({req}){
        //this form calls the action called modif in auth route
    return tag('form', {method: 'post', action: '/auth?action=modify'},
    [
        tag('input', { name: 'name', type: 'text'}),
        tag('input', { type: 'submit'}),
    ])
}