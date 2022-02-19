import { Injectable } from "@angular/core";
import * as Rx from "rxjs/Rx";
import { Observable, Observer } from "rxjs";


@Injectable()
export class WebsocketService {
  constructor() { }

  private subject: any;

  create(url): any {
    let ws = new WebSocket(url);

    let observable = new Observable((obs) => {
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = obs.error.bind(obs);
      ws.onclose = obs.complete.bind(obs);
      // return ws.close.bind(ws);
    });
    let observer = {
      next: (data: Object) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      }
    };
    // let subject = new Rx.Subject<MessageEvent>();
    // observable.subscribe(subject)
    // subject.obser
    return observable;
  }

  public connect(url): any {
    if (!this.subject) {
      this.subject = this.create(url);
    }
    return this.subject;
  }


}
