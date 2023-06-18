import { tag } from "@ulibs/Router"


//example 1
export default function({req}){
    return tag('ul', {}, 
        [
            //these links sends partial request the page in the route
            //partial requests return the page with the layout of the route 
            //but without the layout of the parrent routes
            //the response automaticaly places in the content section of parent layout
            //if out consider one specific place for the response please see next example
            tag('a', {href: '/'}, ' go home page'), // return home page and layout
            tag('a', {href: '/docs/router'}, ' router docs'),//return router page and layout of router but not layout of docs and home page
            tag('a', {href: '/register'}, ' register'),
        ]
    )
}

//example 2
export default function({req}){
    return tag('ul', {}, 
        [
            //this works simillar to above but the deffirence is that the response data is placed in side the element that the id is given
            tag('a', {href: '/?for= idOfaComponent'}, ' go home page'),
            tag('a', {href: '/docs/router?for= idOfaComponent'}, ' router docs'),
            tag('a', {href: '/register?for=idOfaComponent'}, ' register'),
        ]
    )
}