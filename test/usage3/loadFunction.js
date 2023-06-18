import { tag } from "@ulibs/Router"

//the load function is execited before the page and can pass data to page usin req object
export async function load({req}){
    const User = db.getModel('user')
    const users = User.get()
    req.users = users
}


export default function({req}){
    //renders users list
    return tag('ul', {}, 
        [
            ...req.users.map(user=>{
                return tag('li', {}, user.name)
            })
        ]
    )
}