import {selectClientCount} from './selectors';
import {connect} from 'react-redux';
import {IRootStateRecord} from '../../store';
import {Metrics} from './Metrics';

const mapStateToProps = (state: IRootStateRecord) => ({
  clientCount: selectClientCount(state),
});

export const MetricsConnected = connect(mapStateToProps)(Metrics);
