import {tag } from "../ui/index.js";

export default function(content){
    console.log('layout: ', content)
    return tag('main', {}, 
        [
            tag('header', {class: "header", style :"background-color: yellow"}, 'hellow: wellcom to ubuildercms'),
            tag('div', {}, tag('h1', {}, content)),
            tag('div', {id: 'data-target'}, ),
            tag('script', {src: 'http://localhost:1000/index.js'},  )
        ]
    )
}