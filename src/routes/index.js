import { renderTemplate, tag } from "../ui/index.js";

export default function(prop){
    return tag('div', {}, [
        tag('a', {href:'./'}, "home"),
        tag('a', {href:'./about/'}, "about"),
        tag('a', {href:'./contact/'}, "contact"),
        tag('a', {href:'./login/'}, "login"),
        tag('a', {href:'./user/'}, "user"),
    ])
}


