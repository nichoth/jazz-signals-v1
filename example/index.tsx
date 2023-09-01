import { render } from 'preact'
import { TodoApp } from './todo-app.jsx'

render(<TodoApp
    appName="Jazz Todo List Example"
    syncAddress={
        new URLSearchParams(window.location.search).get('sync') || undefined
    }
/>, document.getElementById('root')!)
