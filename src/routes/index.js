import { tag } from "../ui/index.js";

export default function(prop){
    return tag('div', {}, 'hellow world this is home page')
}

export function error(prop){
    return tag('div', {}, 'error ocured')
}


