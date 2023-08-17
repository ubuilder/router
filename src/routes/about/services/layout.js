import { tag } from "../../../ui/index.js"
export default function({req, res, content}){
    console.log('layout: ', content)
    return tag('div', {}, [
        tag('div', {}, [

            tag('h3', {}, 'services layout'),
            tag('a', {href: './'}, 'home'),
            tag('a', {href: './about'}, 'about'),
            tag('a', {href: './about/sponser'}, 'sponser'),
            // tag('hr', {}, [])
        ]),
        tag('div', {}, content)

    ])
}