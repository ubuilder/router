import { tag } from "../../../ui/index.js"
export default function({req, res, content}){
    console.log('layout: ', content)
    return tag('div', {}, [
        tag('div', {}, [

            tag('h3', {}, 'mission layout'),
            tag('a', {href: './'}, 'home'),
            tag('a', {href: './about'}, 'about'),
            // tag('hr', {}, [])
        ]),
        tag('div', {}, content)

    ])
}