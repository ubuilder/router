import { tag } from "../../ui/index.js"

export default function({req, res}){
    return tag('div', {htmlHead:  "<style>div {background-color: rgb(200,200,200)}</style><title>about</title>", class: 'index'}, 'about')
}