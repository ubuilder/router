import { tag } from "../../ui/index.js"
export default function({req, res, content}){
    console.log('layout: ', content)
    return tag('div', {}, [
        tag('div', {}, 'user layout'),
        tag('div', {}, content)
    ])
}