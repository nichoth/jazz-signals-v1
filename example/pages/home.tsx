import { FunctionComponent } from 'preact'
import { useState } from 'preact/hooks'
import { TextInput } from '../components/text-input.jsx'
import { Button } from '../components/button.jsx'

export function Home ({ setRoute }:{
    setRoute:(path:string) => void;
}):FunctionComponent {
    function createList (name:string) {
        console.log('create a new list', name)
    }

    return (<div className="route home">
        <h2>Create a new todo-list</h2>
        <NewList onSubmit={createList} />
    </div>)
}

function NewList ({ onSubmit }:{
    onSubmit:(name:string) => any
}):FunctionComponent {
    const [isValid, setValid] = useState<boolean>(false)

    function input (ev:InputEvent & { target: HTMLFormElement }) {
        const form = ev.target
        const isOk = form.checkValidity()
        if (isOk !== isValid) setValid(isOk)
    }

    function submit (ev:SubmitEvent & { target: HTMLFormElement }) {
        ev.preventDefault()
        const name = ev.target.elements['list-name'].value
        onSubmit(name)
    }

    return (<form className="new-list" onInput={input} onSubmit={submit}>
        <TextInput name="list-name" displayName="List name"
            minLength={3}
            required={true}
        />

        <Button type="submit" isSpinning={false} disabled={!isValid}>
            Create list
        </Button>
    </form>)
}
