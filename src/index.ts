import React from "react"

type State = object | any
type Listener = (newState: State) => void

export interface ISubscription {
	subscribe: (fn: Listener) => void,
	unsubscribe: (fn: Listener) => void,
	listener: Listener[],
	state: State
}

export function createSubscription(initialState: any = {}): ISubscription {
	const state = initialState
	let listener: Listener[] = []
	const subscribe = (fn: Listener) => listener.push(fn)
	const unsubscribe = (fn: Listener) => (listener = listener.filter(f => f !== fn))
	return { subscribe, unsubscribe, listener, state }
}

export interface IStateUpdater {
	setState: (newState: State) => void
	state: State
}

export function useSubscription(subscriber: ISubscription, pick: string[] = []): IStateUpdater {
	let { state } = subscriber
	const [, setUpdate] = React.useState()

	const setState = React.useCallback((newState: State) => {
		typeof newState === "object" ? Object.assign(state, newState) : (state = newState)
		subscriber.listener.forEach(fn => fn(newState))
	}, [])

	React.useEffect(() => {
		let mounted = true
		const updater = (nextState: State) => mounted && (!pick.length || typeof nextState !== "object" || (Object.keys(nextState).find(k => pick.includes(k)))) && setUpdate({})
		subscriber.subscribe(updater)
		return () => {
			mounted = false
			subscriber.unsubscribe(updater)
		}
	}, [])
	return { state, setState }
}
