import { FunctionComponent } from 'preact'
import { useCallback } from 'preact/hooks'
import { TextInput } from './text-input.jsx'
import { Button } from './button.jsx'

export const SubmittableInput:FunctionComponent<{
    onSubmit: (text: string) => any;
    displayName:string;
    disabled?: boolean;
    action:string;
}> = function SubmittableInput ({
    onSubmit,
    displayName,
    disabled,
    action
}) {
    const handleSubmit = useCallback(function handleSubmit (ev) {
        ev.preventDefault()
        const textEl = ev.target.elements.namedItem(
            'text'
        ) as HTMLInputElement

        onSubmit(textEl.value)
        textEl.value = ''
    }, [onSubmit])

    return (
        <form
            className="submittable-input"
            onSubmit={handleSubmit}
        >
            <TextInput
                className="submittable-input"
                displayName={displayName}
                name="text"
                disabled={disabled}
                minLength={3}
            />

            <Button type="submit" isSpinning={false}>{action}</Button>
        </form>
    )
}
