import { tag } from "../../ui/index.js"

export default function(){
    return tag('div', {htmlHead:  "<style>div {background-color: green}</style><title>about</title>", class: 'index'}, 'about')
}