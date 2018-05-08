import 'rxjs/add/operator/mergeMap';
import {Epic} from 'redux-observable';
import {TypedRecord} from 'typed-immutable-record';
import {ConnectionAction} from './navbar/connection/actions';
import {IConnectionStateRecord} from './navbar/connection/ConnectionStateRecord';
import {MonoidStoreAction} from './monoidstore/actions';
import {MonoidStoreRoot} from './monoidstore/reducer';
import {GlobalAlertAction} from './globalAlert/actions';
import {IGlobalAlertStateRecord} from './globalAlert/GlobalAlertStateRecord';

export type IRootAction =
  GlobalAlertAction
  | ConnectionAction
  | MonoidStoreAction;

export interface IRootState {
  globalAlert: IGlobalAlertStateRecord;
  connectionState: IConnectionStateRecord;
  store: MonoidStoreRoot;
}

export interface IRootStateRecord extends TypedRecord<IRootStateRecord>, IRootState {
}

export type RootEpic = Epic<IRootAction, IRootStateRecord>;
