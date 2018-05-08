import * as classNames from 'classnames';
import {Observer} from 'rxjs/Observer';
import * as React from 'react';
import {Badge, Nav, NavItem, NavLink, TabContent, TabPane} from 'reactstrap';
import {MonoidStoreObserver} from '../monoidstore/MonoidStoreObserver';
import {ConnectionStateEnum} from '../navbar/connection/ConnectionStateRecord';
import {ConnectionAction} from '../navbar/connection/actions';
import {MonoidStoreAction} from '../monoidstore/actions';
import {GlobalAlertAction} from '../globalAlert/actions';
import {ClientStreams} from './stream/ClientStreams';

export interface AppMainProps {
  connectionState: ConnectionStateEnum;
  dispatchConnectionAction: (connectionAction: ConnectionAction) => any;
  dispatchGlobalAlertAction: (globalAlertAction: GlobalAlertAction) => any;
  dispatchMonoidStoreAction: (monoidStoreAction: MonoidStoreAction) => any;
  className?: string;
  style?: React.CSSProperties;
}

type State = {
  activeTab: string;
};

export class AppMain extends React.Component<AppMainProps, State> {

  state: State = {
    activeTab: '1',
  };

  private readonly clientStreams: ClientStreams;

  constructor(props: AppMainProps) {
    super(props);
    const {dispatchConnectionAction, dispatchGlobalAlertAction, dispatchMonoidStoreAction} = this.props;

    this.clientStreams = new ClientStreams(new Map<string, Observer<any>>([
      ['store', new MonoidStoreObserver(dispatchGlobalAlertAction, dispatchMonoidStoreAction)]
    ]), dispatchConnectionAction, dispatchGlobalAlertAction);
  }

  private toggle = (activeTab: string) => {
    if (this.state.activeTab !== activeTab) {
      this.setState({activeTab});
    }
  };

  componentWillUnmount() {
    this.clientStreams.dispose();
  }

  render() {
    const {className, style} = this.props;
    const componentClass = classNames(className, 'app');

    return (
      <div className={componentClass} style={style}>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classNames({active: this.state.activeTab === '1'})}
              onClick={() => {
                this.toggle('1');
              }}
            >Tab1</NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classNames({active: this.state.activeTab === '2'})}
              onClick={() => {
                this.toggle('2');
              }}
            >Tab2</NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId='1'>
            <Badge>TAB 1</Badge>
          </TabPane>
          <TabPane tabId='2'>
            <Badge>TAB 2</Badge>
          </TabPane>
        </TabContent>
      </div>
    );
  }
}
