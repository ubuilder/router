import { tag } from "../../ui/index.js"
export default function({content}){
    console.log('layout: ', content)
    return tag('div', {}, [
        tag('div', {}, [

            tag('h3', {}, 'about layout'),
            tag('a', {href: './about/mission'}, 'our mission'),
            tag('a', {href: './about/services'}, 'our services'),
            tag('a', {href: './about/sponser'}, 'our sponsers'),
            // tag('hr')
        ]),
        tag('div', {}, content)

    ])
}