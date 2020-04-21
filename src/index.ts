import React from "react"

type State = object | any
type Listener = (newState: State) => void
export interface ISubscription {
	subscribe: (fn: Listener) => void
	unsubscribe: (fn: Listener) => void
	listener: Listener[]
	state: State
	initialState: State
}

export function createSubscription(initialState: any = {}): ISubscription {
	const state = initialState || {}
	let listener: Listener[] = []
	const subscribe = (fn: Listener) => listener.push(fn)
	const unsubscribe = (fn: Listener) =>
		(listener = listener.filter((f) => f !== fn))
	return { subscribe, unsubscribe, listener, state, initialState }
}

export interface IStateUpdater {
	setState: (newState: State, callback?: (newState: State) => void) => void
	state: State
}
export interface IStateReduceUpdater {
	dispatch: (p: any) => void
	state: State
}

function useSubscriber(subscriber: ISubscription, pick?: string[]) {
	const [changed, setUpdate] = React.useState({})
	const mounted = React.useRef(true)
	const updater = React.useCallback((nextState: State) => {
		if (
			mounted.current &&
			(!pick ||
				!pick.length ||
				typeof nextState !== "object" ||
				nextState.constructor !== Object ||
				Object.keys(nextState).find((k) => pick.includes(k)))
		) {
			setUpdate({})
		}
	}, [])
	React.useEffect(() => {
		subscriber.subscribe(updater)
		return () => {
			mounted.current = false
			subscriber.unsubscribe(updater)
		}
	}, [])
	return changed
}

export function useReducerSubscription(
	subscriber: ISubscription,
	reducer: any = () => {},
): IStateReduceUpdater {
	useSubscriber(subscriber)
	const dispatch = (...args: any) => {
		const newState = reducer(subscriber.state, ...args)
		subscriber.state = Object.assign({}, subscriber.state, newState)
		subscriber.listener.forEach((fn) => fn(newState))
	}
	React.useDebugValue(subscriber.state)

	return { state: subscriber.state, dispatch }
}

export function useSubscription(
	subscriber: ISubscription,
	pick?: string[],
): IStateUpdater {
	useSubscriber(subscriber, pick)

	const setState = React.useCallback((newState: State, callback = () => {}) => {
		subscriber.state =
			newState &&
			typeof newState === "object" &&
			newState.constructor === Object
				? Object.assign({}, subscriber.state, newState)
				: newState
		subscriber.listener.forEach((fn) => fn(newState))
		callback(newState)
	}, [])

	React.useDebugValue(subscriber.state)
	return { state: subscriber.state, setState }
}
