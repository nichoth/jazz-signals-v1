import { FunctionComponent } from 'preact'
import { useCallback } from 'preact/hooks'
import { TextInput } from './text-input.jsx'
import { Button } from './button.jsx'
// import { Input } from "@/basicComponents/ui/input";
// import { Button } from "@/basicComponents/ui/button";

export const SubmittableInput:FunctionComponent<{
    onSubmit: (text: string) => any;
    displayName:string;
    disabled?: boolean;
}> = function SubmittableInput ({
    onSubmit,
    displayName,
    disabled,
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

            <Button type="submit" isSpinning={false}>Create new task</Button>

            {/* <Input
                className="-ml-3 -my-2 flex-grow flex-3 text-base"
                name="text"
                placeholder={placeholder}
                autoComplete="off"
                disabled={disabled}
            /> */}

            {/* <Button asChild type="submit" className="flex-shrink flex-1 cursor-pointer">
                <Input type="submit" value={label} disabled={disabled} />
            </Button> */}
        </form>
    )
}
