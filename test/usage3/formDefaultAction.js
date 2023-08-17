import tag from '@ulibs/Router'


export const actions = {
    default: ({req})=>{
        //process form data
        const formData = req.formData
        //pass the data to page and render the page
        return true
    },
}

//usage default
export default function({req}){
        //this form calls the default action
    return tag('form', {method: 'post', action: '/auth'},
    [
        tag('input', { name: 'name', type: 'text'}),
        tag('input', { type: 'submit'}),
    ])
}
//usage named actions
export default function({req}){
        //this form calls the action called register in auth route
    return tag('form', {method: 'post', action: '/auth?action=register'},
    [
        tag('input', { name: 'name', type: 'text'}),
        tag('input', { type: 'submit'}),
    ])
}
//usage named actions
export default function({req}){
        //this form calls the action called modify in auth route
    return tag('form', {method: 'post', action: '/auth?action=modify'},
    [
        tag('input', { name: 'name', type: 'text'}),
        tag('input', { type: 'submit'}),
    ])
}