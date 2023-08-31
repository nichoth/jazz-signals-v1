import { LocalAuthComponent } from '../src/auth-local.jsx'
import { useState } from 'preact/hooks'

export const PrettyAuthComponent:LocalAuthComponent = ({
    loading,
    logIn,
    signUp,
}) => {
    const [username, setUsername] = useState<string>('')

    return (<div className="w-full h-full flex items-center justify-center p-5">
        {loading ? (
            <div>Loading...</div>
        ) : (
            <div className="w-72 flex flex-col gap-4">
                <form
                    className="w-72 flex flex-col gap-2"
                    onSubmit={(e) => {
                        e.preventDefault()
                        signUp(username)
                    }}
                >

                    <input
                        placeholder="Display name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="webauthn"
                        className="text-base"
                    />
                    <button asChild>
                        <input
                            type="submit"
                            value="Sign Up as new account"
                        />
                    </button>
                </form>

                <button onClick={logIn}>
                    Log In with existing account
                </button>
            </div>
        )}
    </div>)
}
