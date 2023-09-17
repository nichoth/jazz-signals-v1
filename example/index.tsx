import { render } from 'preact'
import { TodoApp } from './todo-app.jsx'
import { State } from './state.js'

/**
 * These *must* be called outside the render loop, because they create signals.
 * Or, call with `useMemo` inside the render loop.
 *
 * This is where we create the `localNode`, the interface with Jazz. We want
 * only 1 localNode per app instance.
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
