import 'babel-polyfill';
// import './main.less';
import * as React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {default as singletons} from './singletons';
import {AppNavBar} from './navbar/AppNavBar';
import {AlertToasterConnected} from './globalAlert/AlertToasterConnected';
import {AppMainConnected} from './app/AppMainConnected';

/*
import * as Loadable from 'react-loadable';
import {AppLoadingComponent} from './app/AppLoadingComponent';
const LoadableApp = Loadable({
  loader: () => import('./app/AppLoadable'),
  loading: AppLoadingComponent
});
*/

const Root = (
  <Provider store={singletons.rootStore}>
    <div className='root-container'>

      <AppNavBar className='navbar-row'/>

      <main className='main-container'>
        <AppMainConnected/>
      </main>

      <AlertToasterConnected className='footer'/>

    </div>
  </Provider>
);

render(Root, document.getElementById('root'));
