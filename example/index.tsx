import { render } from 'preact'
import { TodoApp } from './todo-app.jsx'
import { State } from './state.js'

/**
 * These *must* be called outside the render loop, because they create signals.
 * Or, call with `useMemo` inside the render loop.
 *
 * This is where we create the `localNode`, the interface with Jazz. There
 * is a single localNode for the app
 */
const state = State()
const bus = State.Bus(state)

render(<TodoApp
    appName="jazz-preact Todo List Example"
    emit={bus.emit.bind(bus)}
    state={state}
/>, document.getElementById('root')!)
