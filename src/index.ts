import React from "react"

type Listener<S> = (newState: S) => void

export interface ISubscription<S extends any> {
	subscribe: (fn: Listener<S>) => void
	unsubscribe: (fn: Listener<S>) => void
	listener: Set<Listener<S>>
	state: S
	updateState: (nextState: S, forceUpdate?: boolean) => void
}

export function createSubscription<S extends any>(
	initialState?: S,
): ISubscription<S> {
	const state: S = initialState || ({} as any)
	let listener: Set<Listener<S>> = new Set()
	const subscribe = (fn: Listener<S>) => {
		listener.add(fn)
	}
	const unsubscribe = (fn: Listener<S>) => listener.delete(fn)
	const updateState = (nextState: S, forceUpdate = true) => {
		Object.assign(state, nextState)
		if (forceUpdate) {
			listener.forEach((fn) => fn(nextState))
		}
	}
	return { subscribe, unsubscribe, listener, state, updateState }
}

export interface IStateUpdater<S> {
	changed?: any
	setState: (newState: any, callback?: (newState: S) => void) => void
	state: S
}

export interface IStateReduceUpdater<S> {
	dispatch: (p: any) => void
	state: S
}

function useSubscriber<S extends object>(
	subscriber: ISubscription<S>,
	pick?: string[],
) {
	const [changed, setUpdate] = React.useState({})
	// const mounted = React.useRef(true)
	const updater = React.useCallback(
		(nextState: S) => {
			if (
				!pick ||
				!pick.length ||
				typeof nextState !== "object" ||
				nextState.constructor !== Object ||
				Object.keys(nextState).find((k) => pick.includes(k))
			) {
				setUpdate({})
			}
		},
		[pick],
	)
	React.useEffect(() => {
		subscriber.subscribe(updater)
		return () => {
			subscriber.unsubscribe(updater)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	return changed
}

export function useReducerSubscription<S extends object>(
	subscriber: ISubscription<S>,
	reducer: any = () => {},
): IStateReduceUpdater<S> {
	useSubscriber(subscriber)
	const dispatch = (...args: any) => {
		const newState = reducer(subscriber.state, ...args)
		subscriber.state = Object.assign({}, subscriber.state, newState)
		subscriber.listener.forEach((fn) => fn(newState))
	}
	React.useDebugValue(subscriber.state)

	return { state: subscriber.state, dispatch }
}

export function useSubscription<S extends object>(
	subscriber: ISubscription<S>,
	pick?: string[],
): IStateUpdater<S> {
	const changed = useSubscriber(subscriber, pick)
	React.useDebugValue(subscriber.state)
	return {
		changed,
		state: subscriber.state,
		setState: React.useCallback(
			(newState: any, callback?: Function) => {
				if (typeof newState === "object" && newState.constructor === Object) {
					subscriber.state = Object.assign({}, subscriber.state, newState)
				} else if (typeof newState === "function") {
					const nextState = newState(subscriber.state)
					subscriber.state = Object.assign({}, subscriber.state, nextState)
				} else {
					subscriber.state = newState
				}
				subscriber.listener.forEach((fn) => fn(newState))
				callback && callback()
			},
			// eslint-disable-next-line react-hooks/exhaustive-deps
			[subscriber.state, pick],
		),
	}
}
