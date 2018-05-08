import {Observer} from 'rxjs/Observer';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/observable/dom/webSocket';
import {WebSocketSubject, WebSocketSubjectConfig} from 'rxjs/observable/dom/WebSocketSubject';
import {ConnectionAction, connectionActionCreators} from '../../navbar/connection/actions';
import {createWebSocketEpic} from './epic';
import {IRootAction} from '../../store';
import {default as singletons} from '../../singletons';
import {GlobalAlertAction, globalAlertActionCreators} from '../../globalAlert/actions';

export class ClientStreams {

  private static readonly DISCONNECTED_STREAM_OBSERVER: Observer<any> = {
    next: () => {
    },
    error: () => {
    },
    complete: () => {
    },
  };

  private readonly streams: Map<string, Observer<any>> = new Map<string, Observer<any>>();
  private readonly webSocketSubject: WebSocketSubject<any>;

  private streamCounter = 0;

  constructor(initialObservers: Map<string, Observer<any>>,
              private readonly dispatchConnectionAction: (connectionAction: ConnectionAction) => any,
              private readonly dispatchGlobalAlertAction: (globalAlertAction: GlobalAlertAction) => any) {

    initialObservers.forEach((observer, streamId) => {
      this.streams.set(streamId, observer);
    });

    const url = ClientStreams.calcWsUrl();

    const webSocketSubjectConfig: WebSocketSubjectConfig = {
      url,
      openObserver: {
        next: () => {
          console.info(`[${new Date().toISOString()}] WebSocket connected - ${url}`);
          dispatchConnectionAction(connectionActionCreators.connectionConnected());
        }
      },
      closeObserver: {
        next: () => {
          console.info(`[${new Date().toISOString()}] WebSocket disconnected - ${url}`);
          this.allStreamsDisconnected();
          dispatchConnectionAction(connectionActionCreators.connectionDisconnected());
        }
      },
    };

    this.webSocketSubject = Observable.webSocket(webSocketSubjectConfig) as WebSocketSubject<any>;

    singletons.rootEpic$.next(createWebSocketEpic(this.webSocketSubject, this.receiveFrame));

    this.webSocketSubject.subscribe({
      error: this.receiveError
    });

    this.dispatchConnectionAction(connectionActionCreators.connectConnection());
  }

  private receiveError(err: string): void {
    this.dispatchGlobalAlertAction(globalAlertActionCreators.globalAlert(err, 'danger'));
  }

  dispose = () => {
    this.webSocketSubject.unsubscribe();
  };

  subscribeStream: (streamURI: string, observer: Observer<any>) => Subscription =
    (streamURI, observer) => {
      const streamId = this.nextStreamId();
      this.send(streamId, streamURI);
      this.streams.set(streamId, observer);

      const subscription = new Subscription(() => {
        this.send(streamId, null);
      });

      subscription.add(() => {
        this.streams.set(streamId, ClientStreams.DISCONNECTED_STREAM_OBSERVER);
      });

      return subscription;
    };

  private send = (streamId: string, data: any) => {
    // console.warn('send', streamId, data);
    this.webSocketSubject.next(JSON.stringify({[streamId]: data}));
  };

  private allStreamsDisconnected() {
    const error = new Error('Main socket disconnected');
    this.streams.forEach(i => i.error(error));
    this.streams.clear();
  }

  private static calcWsUrl(): string {
    // FIXME: TODO: uncomment code
    // if (process.env.NODE_ENV !== 'production') {
    const wsUrl = 'ws://localhost:8080/ws';
    console.warn(`[${new Date().toISOString()}] DEVELOPMENT MODE ENGAGED`);
    return wsUrl;
    // }
    //
    // if (window.location.protocol !== 'https:') {
    //   console.warn('Using insecure ws protocol as page loaded with', window.location.protocol);
    // }
    //
    // return window.location.protocol === 'https:' ? `wss://${window.location.host}:8080/ws` : `ws://${window.location.host}/ws`;
  }

  private receiveFrame: (msg: any) => IRootAction[] =
    msg => {
      if (typeof msg !== 'object') {
        return [globalAlertActionCreators.globalAlert(new Error(`MalformedStreamMessage: ${JSON.stringify(msg)}`), 'danger')];
      }

      Object.keys(msg)
        .forEach(streamId => {
          if (streamId !== '_stream') {
            if (this.streams.has(streamId)) {
              this.streams.get(streamId)!.next(msg[streamId]);
            } else {
              this.dispatchGlobalAlertAction(globalAlertActionCreators.globalAlert(new Error(`UnknownStream streamId="${streamId}" value=${JSON.stringify(msg[streamId])}`), 'warning'));
            }
          }
        });

      if (msg._stream) {
        Object.keys(msg._stream)
          .forEach(streamId => {
              const cmd = msg._stream[streamId];
              if (cmd === null) {
                if (this.streams.has(streamId)) {
                  this.streams.get(streamId)!.complete();
                  this.streams.delete(streamId);
                } else {
                  this.dispatchGlobalAlertAction(globalAlertActionCreators.globalAlert(new Error(`CompleteUnknownStream streamId="${streamId}"`), 'warning'));
                }

              } else if (typeof cmd === 'string') {
                if (this.streams.has(streamId)) {
                  this.streams.get(streamId)!.error(cmd);
                  this.streams.delete(streamId);
                } else {
                  this.dispatchGlobalAlertAction(globalAlertActionCreators.globalAlert(new Error(`ErrorUnknownStream streamId="${streamId}" value=${cmd}`), 'warning'));
                }

              } else {
                if (this.streams.has(streamId)) {
                  this.streams.get(streamId)!.error(`InvalidStreamCommand streamId="${streamId}" value=${JSON.stringify(cmd)}`);
                  this.streams.delete(streamId);
                } else {
                  this.dispatchGlobalAlertAction(globalAlertActionCreators.globalAlert(new Error(`InvalidUnknownStreamCmd streamId="${streamId}" value=${JSON.stringify(cmd)}`), 'danger'));
                }
              }
            },
            this);
      }

      return [];
    };

  private nextStreamId(): string {
    return `s${this.streamCounter++}`;
  }
}
