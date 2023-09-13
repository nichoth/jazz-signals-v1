import { render } from 'preact'
import { TodoApp } from './todo-app.jsx'
import { State } from './state.js'

/**
 * these *must* be called outside the render loop, because it creates signals.
 * Or, call with `useMemo` inside the render loop
 */
const state = State()
const bus = State.Bus(state)  // subscribe to events here

render(<TodoApp
    appName="Jazz Todo List Example"
    syncAddress={
        new URLSearchParams(window.location.search).get('sync') || undefined
    }
    emit={bus.emit.bind(bus)}
    state={state}
/>, document.getElementById('root')!)
