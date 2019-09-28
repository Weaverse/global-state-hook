import React, { ChangeEvent, useContext } from "react"
import { createSubscription, useSubscription } from "../src/index"
import { render } from "react-dom"

const counterSubscription = createSubscription({ count: 0, foo: 10 })

const useCounter = () => {
	let { state, setState } = useSubscription(counterSubscription)
	const increment = () => setState({ count: state.count + 1 })
	const decrement = () => setState({ count: state.count + 1 })
	return { count: state.count, increment, decrement }
}

function CounterDisplay() {
	let { count, increment, decrement } = useCounter()
	return (
		<div>
			<button onClick={decrement}>-</button>
			<span>{count}</span>
			<button onClick={increment}>+</button>
		</div>
	)
}
function FooDisplay() {
	// Only update when foo change
	let { state, setState } = useSubscription(counterSubscription, ["foo"])

	console.log("Only update when foo change", state)
	return (
		<div>
			<button onClick={() => setState({ foo: state.foo - 1 })}>-</button>
			<span>{state.foo}</span>
			<button onClick={() => setState({ foo: state.foo + 1 })}>+</button>
		</div>
	)
}

const useTextValue = () => {
	const textSubscription = useContext(TextContext)
	let { state, setState } = useSubscription(textSubscription)
	const onChange = (e: ChangeEvent<HTMLInputElement>) =>
		setState(e.target.value)
	return { value: state, onChange }
}

function Text() {
	let { value, onChange } = useTextValue()
	return (
		<div>
			<input value={value} onChange={onChange} />
		</div>
	)
}

const TextContext = React.createContext<any>(null)

function TextComponent() {
	const textSubscription = createSubscription("The text will sync together")
	return (
		<TextContext.Provider value={textSubscription}>
			<Text />

			{/*You can put the Text component anywhere*/}
			<Text />
		</TextContext.Provider>
	)
}

function App() {
	return (
		<>
			<CounterDisplay />
			<FooDisplay />

			<TextComponent />
		</>
	)
}

render(<App />, document.getElementById("root"))
