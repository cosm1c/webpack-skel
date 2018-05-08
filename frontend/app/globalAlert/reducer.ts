import {AnyAction, Reducer} from 'redux';
import {ACK_GLOBAL_ALERT, GLOBAL_ALERT} from './actions';
import {IGlobalAlertStateRecord, initialGlobalAlertState} from './GlobalAlertStateRecord';

export const globalAlertReducer: Reducer<IGlobalAlertStateRecord> =
  (state: IGlobalAlertStateRecord = initialGlobalAlertState, action: AnyAction): IGlobalAlertStateRecord => {
    switch (action.type) {
      case GLOBAL_ALERT:
        console.warn('GlobalAlert date=', action.date, 'Message=', action.message);
        // TODO: handle multiple alerts
        // TODO: allow alerts to self-update
        return state
          .set('date', action.date)
          .set('error', action.error);

      case ACK_GLOBAL_ALERT:
        return state.set('lastAckDate', action.date);

      default:
        return state;
    }
  };
