import { FunctionComponent } from 'preact'
import { SubmittableInput } from './submittable-input.jsx'

export const NewTaskInputRow:FunctionComponent<{
    onCreateTask: (text: string) => void;
    disabled?: boolean;
}> = function NewTaskInputRow ({
    onCreateTask,
    disabled,
}) {
    return (<SubmittableInput
        action="Create a new task"
        onSubmit={onCreateTask}
        displayName="New task name"
        disabled={disabled}
    />)
}
