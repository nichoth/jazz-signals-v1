import { render, FunctionComponent } from 'preact'

const App: FunctionComponent<{}> = function App () {
    return <div>hello</div>
}

render(<App />, document.getElementById('root')!)
