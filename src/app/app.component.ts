import { Component, AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';

 declare var Peer;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements AfterContentInit {
  
  @ViewChild('chatOutput') chatOutput: ElementRef;
  messages: ChatMessage[] = [];
  chatMessage:string = null;
  peerId:string;
  peer;
  connectionId:string = null;

  constructor(private changeDetectorRef: ChangeDetectorRef){}

  ngAfterContentInit(){
    this.peer = new Peer({
      host: 'heesterman.com',
      port: 9000,
      path: '/myapp',
      config: {'iceServers': [
        { url: 'stun:stun.l.google.com:19302' }
      ]}
    });

    this.peer.on('open', (id) => this.onConnected(id));

    this.peer.on('connection', (conn) => this.onConnection(conn));
  }

  public sendMessage(){
    for(let connectionKey of this.connections()){
      for(let connection of this.peer.connections[connectionKey]){
        console.log('send', connection, this.chatMessage);
        connection.send(this.chatMessage);
      }
    }

    this.onMessage(this.connectionId, this.chatMessage);
    this.chatMessage = null;
    this.changeDetectorRef.detectChanges();
  }

  public connectPeer(){
    let conn = this.peer.connect(this.peerId);
    conn.on('data', (message) => this.onMessage(conn.peer, message));
    this.peerId = null;
    this.changeDetectorRef.detectChanges();
  }

  public connections(){
    return Object.keys(this.peer.connections);
  }

  private onConnected(id){
    this.connectionId = id;
    this.changeDetectorRef.detectChanges();
  }

  private onConnection(conn){
    conn.on('data', (message) => this.onMessage(conn.peer, message));
    this.changeDetectorRef.detectChanges();
  }

  private onMessage(peerId, message){
    this.messages.push(new ChatMessage(peerId, message));
 
    this.changeDetectorRef.detectChanges();
    if (this.chatOutput && this.chatOutput.nativeElement){
 
      this.chatOutput.nativeElement.scrollTo(0, this.chatOutput.nativeElement.scrollHeight);
    }
  }

}


class ChatMessage{
  peerId:string;
  message:string;

  constructor(peerId, message){
    this.peerId = peerId;
    this.message = message;
  }
}