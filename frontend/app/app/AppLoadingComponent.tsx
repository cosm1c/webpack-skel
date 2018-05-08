import * as React from 'react';
import * as Loadable from 'react-loadable';

export class AppLoadingComponent extends React.Component<Loadable.LoadingComponentProps> {
  render() {
    return <div>Loading... {JSON.stringify(this.props)}</div>;
  }
}
