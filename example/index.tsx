import { render } from 'preact'
// import { LocalAuth } from '../src/auth-local.jsx'
import { TodoApp } from './todo-app.jsx'

render(<TodoApp
    appName="Jazz Todo List Example"
/>, document.getElementById('root')!)

// syncAddress={
//     new URLSearchParams(window.location.search).get('sync') || undefined
// }

// render(<TodoApp
//     syncAddress={
//         new URLSearchParams(window.location.search).get('sync') || undefined
//     }
//     auth={LocalAuth({ appName: 'Jazz + Preact Todo List Example', })}
// />,
// document.getElementById('root')!)
