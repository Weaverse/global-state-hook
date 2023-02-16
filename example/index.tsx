// @ts-ignore
import React, { ChangeEvent, useContext, useEffect } from "react"
import {
	createReactive,
	createSubscription,
	ISubscription,
	useReactive,
	useReducerSubscription,
	useSubscription,
	useSyncStore,
} from "../src/index"
import { render } from "react-dom"

const counterSubscription = createSubscription({ count: 0, foo: 10 })

const useCounter = () => {
	let { state, setState } = useSubscription(counterSubscription)
	const increment = () => setState({ count: state.count + 1 })
	const decrement = () => setState({ count: state.count - 1 })
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
let CounterDisplay2 = () => {
	let { state, subscriber } = useSyncStore(counterSubscription)
	return (
		<div>
			Counter syncing with useSyncStore store: {state.count}
			<button onClick={() => subscriber.updateState({ count: 0 })}>
				Reset
			</button>
		</div>
	)
}
function FooDisplay() {
	// Only update when foo change
	let { state, setState } = useSubscription(counterSubscription, ["foo"])

	console.log("Only update when foo change", state)
	return (
		<div>
			Only update when foo change
			<button onClick={() => setState((x: any) => ({ foo: x.foo - 1 }))}>
				-
			</button>
			<span>{state.foo}</span>
			<button onClick={() => setState({ foo: state.foo + 1 })}>+</button>
		</div>
	)
}

const useTextValue = () => {
	const textSubscription = useContext<ISubscription<any>>(TextContext)
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

const TextContext = React.createContext<ISubscription<string>>(null)

// function TextComponent() {
// 	const textSubscription = createSubscription("The text will sync together")
// 	return (
// 		<TextContext.Provider value={textSubscription}>
// 			<Text />
// 			<Text />
// 		</TextContext.Provider>
// 	)
// }

const fakeData = [
	{
		name: "Minh",
		email: "phanminh65@gmail.com",
	},
	{
		name: "Tester 1",
		email: "tester1@gmail.com",
	},
]

const mounterSubscription = createSubscription({ display: false, data: [] })

function DelayFetch() {
	const { setState, state } = useSubscription(mounterSubscription)
	useEffect(() => {
		console.log(
			"fetching... it will stop update if component is unmount but the state will still be changed",
		)
		setTimeout(() => {
			setState({ data: fakeData }, () => {
				console.log("fetch data done...", state)
			})
		}, 5000)
	}, [state.display])

	return (
		<div>
			{state.data.map((d: any) => {
				return (
					<div key={d.name}>
						<strong>{d.name}</strong>
						<span>{d.email}</span>
					</div>
				)
			})}
		</div>
	)
}

function MountAndUnmount() {
	const { state, setState } = useSubscription(mounterSubscription)

	// If you unmount when data is fetching
	return (
		<div>
			<button onClick={() => setState({ display: !state.display })}>
				{state.display ? "Unmount" : "Mount"}
			</button>
			{state.display && <DelayFetch />}
		</div>
	)
}

const initialState = { count: 0 }
const counter2Sub = createSubscription(initialState)
function reducer(state: any, action: any) {
	switch (action.type) {
		case "increment":
			return { count: state.count + 1 }
		case "decrement":
			return { count: state.count - 1 }
		default:
			throw new Error()
	}
}

function Counter2() {
	const { state, dispatch } = useReducerSubscription(counter2Sub, reducer)
	return (
		<>
			Count: {state.count}
			<button onClick={() => dispatch({ type: "decrement" })}>-</button>
			<button onClick={() => dispatch({ type: "increment" })}>+</button>
		</>
	)
}

const sourceOfTruth = createReactive({
	text1: "Text 1 sync together",
	text2: "Text 2 walk alone.",
})
const Text1 = () => {
	const state = useReactive(sourceOfTruth, ["text1"])
	return (
		<input
			value={state.text1}
			onChange={(e) => (state.text1 = e.target.value)}
		/>
	)
}
const Text2 = () => {
	const state = useReactive(sourceOfTruth, ["text2"])
	return (
		<input
			value={state.text2}
			onChange={(e) => (state.text2 = e.target.value)}
		/>
	)
}
const ReactiveApp = () => {
	return (
		<div>
			<h1>Reactive pattern:</h1>
			<Text1 />
			<Text2 />
			<Text1 />
		</div>
	)
}

function App() {
	return (
		<>
			<Counter2 />
			<Counter2 />
			{/*a line break*/}
			<div
				style={{
					marginTop: 20,
					marginBottom: 20,
					borderBottom: "1px solid #ccc",
				}}
			></div>
			<CounterDisplay />
			<CounterDisplay2 />
			<FooDisplay />

			<div
				style={{
					marginTop: 20,
					marginBottom: 20,
					borderBottom: "1px solid #ccc",
				}}
			></div>
			<MountAndUnmount />

			<div
				style={{
					marginTop: 20,
					marginBottom: 20,
					borderBottom: "1px solid #ccc",
				}}
			></div>
			<ReactiveApp />
		</>
	)
}

render(<App />, document.getElementById("root"))
