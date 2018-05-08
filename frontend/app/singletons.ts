import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/mergeMap';
import {applyMiddleware, createStore, MiddlewareAPI, Store} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';
import {ActionsObservable, combineEpics, createEpicMiddleware} from 'redux-observable';
import {makeTypedFactory} from 'typed-immutable-record';
import {combineReducers} from 'redux-immutable';
import {IRootAction, IRootState, IRootStateRecord, RootEpic} from './store';
import {initialConnectionState} from './navbar/connection/ConnectionStateRecord';
import {connectionStateReducer} from './navbar/connection/reducer';
import {emptyMonoidStore, monoidStoreReducer} from './monoidstore/reducer';
import {initialGlobalAlertState} from './globalAlert/GlobalAlertStateRecord';
import {globalAlertReducer} from './globalAlert/reducer';

const defaultRootState: IRootState = {
  globalAlert: initialGlobalAlertState,
  connectionState: initialConnectionState,
  store: emptyMonoidStore,
};

const InitialStateFactory = makeTypedFactory<IRootState, IRootStateRecord>(defaultRootState);

const initialState = InitialStateFactory(defaultRootState);

const rootReducer = combineReducers<IRootStateRecord>(
  {
    globalAlert: globalAlertReducer,
    connectionState: connectionStateReducer,
    store: monoidStoreReducer,
  }
  // do we need to provide getDefaultState here?
);

const rootEpic$: BehaviorSubject<RootEpic> = new BehaviorSubject(combineEpics(
  // Add epics to start on page load here
));

/*
console.log('singletons loaded');
rootEpic$.subscribe({
  next: () => {
    console.warn('rootEpic$ subscription received:', Date.now(), arguments);
    // debugger;
  }
});
*/

const rootEpic: RootEpic =
  (action$: ActionsObservable<IRootAction>, store: MiddlewareAPI<IRootStateRecord>) =>
    rootEpic$.mergeMap(epic =>
      epic(action$, store, undefined)
    );

const epicMiddleware = createEpicMiddleware(rootEpic);

const rootStore: Store<IRootStateRecord> = createStore(
  rootReducer,
  initialState!,
  composeWithDevTools(applyMiddleware(epicMiddleware))
);

export default {
  rootStore,
  rootEpic$
};
