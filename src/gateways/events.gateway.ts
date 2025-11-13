import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Broadcast detection event to all clients
   */
  broadcastDetection(data: any) {
    this.logger.log('Broadcasting detection event');
    this.server.emit('detection', data);
  }

  /**
   * Broadcast violation event to all clients
   */
  broadcastViolation(data: any) {
    this.logger.log('Broadcasting violation event');
    this.server.emit('violation', data);
  }

  /**
   * Broadcast camera status change
   */
  broadcastCameraStatus(data: any) {
    this.logger.log('Broadcasting camera status event');
    this.server.emit('camera_status', data);
  }

  /**
   * Broadcast statistics update
   */
  broadcastStatsUpdate(data: any) {
    this.logger.log('Broadcasting stats update');
    this.server.emit('stats_update', data);
  }

  @SubscribeMessage('ping')
  handlePing(): string {
    return 'pong';
  }
}
