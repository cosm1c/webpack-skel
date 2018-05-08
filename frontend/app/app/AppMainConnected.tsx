import {bindActionCreators} from 'redux';
import {connect, Dispatch} from 'react-redux';
import {IRootAction, IRootStateRecord} from '../store';
import {selectConnectionState} from '../navbar/connection/selectors';
import {AppMain} from './AppMain';

const mapStateToProps = (state: IRootStateRecord) => ({
  connectionState: selectConnectionState(state),
});

const mapDispatchToProps = (dispatch: Dispatch<IRootAction>) => bindActionCreators({
  dispatchConnectionAction: dispatch,
  dispatchGlobalAlertAction: dispatch,
  dispatchMonoidStoreAction: dispatch
}, dispatch);

export const AppMainConnected = connect(mapStateToProps, mapDispatchToProps)(AppMain);
