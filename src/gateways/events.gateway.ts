import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

interface CameraSubscription {
  socketId: string;
  cameraId: string;
  subscribedAt: Date;
}

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
  private subscriptions = new Map<string, CameraSubscription[]>();

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.subscriptions.set(client.id, []);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.subscriptions.delete(client.id);
  }

  @SubscribeMessage('subscribe_camera')
  handleSubscribeCamera(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { camera_id: string },
  ) {
    const subscriptions = this.subscriptions.get(client.id) || [];

    // Check if already subscribed
    const existing = subscriptions.find((s) => s.cameraId === data.camera_id);
    if (existing) {
      this.logger.log(
        `Client ${client.id} already subscribed to camera ${data.camera_id}`,
      );
      return { success: true, message: 'Already subscribed' };
    }

    // Add subscription
    subscriptions.push({
      socketId: client.id,
      cameraId: data.camera_id,
      subscribedAt: new Date(),
    });
    this.subscriptions.set(client.id, subscriptions);

    // Join room for this camera
    void client.join(`camera:${data.camera_id}`);

    this.logger.log(
      `Client ${client.id} subscribed to camera ${data.camera_id}`,
    );
    this.logger.log(
      `Client ${client.id} joined room: camera:${data.camera_id}`,
    );

    // Log current room members
    const rooms = this.server.sockets.adapter.rooms.get(
      `camera:${data.camera_id}`,
    );
    this.logger.log(
      `Room camera:${data.camera_id} now has ${rooms?.size || 0} members`,
    );

    return {
      success: true,
      message: `Subscribed to camera ${data.camera_id}`,
    };
  }

  @SubscribeMessage('unsubscribe_camera')
  handleUnsubscribeCamera(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { camera_id: string },
  ) {
    const subscriptions = this.subscriptions.get(client.id) || [];

    // Remove subscription
    const filtered = subscriptions.filter((s) => s.cameraId !== data.camera_id);
    this.subscriptions.set(client.id, filtered);

    // Leave room
    void client.leave(`camera:${data.camera_id}`);

    this.logger.log(
      `Client ${client.id} unsubscribed from camera ${data.camera_id}`,
    );

    return {
      success: true,
      message: `Unsubscribed from camera ${data.camera_id}`,
    };
  }

  /**
   * Broadcast frame with detections to subscribed clients
   */
  broadcastFrame(data: {
    camera_id: string;
    camera_name: string;
    frame_number: number;
    frame_data: string; // ← base64 encoded image data
    detections: any[];
    total_persons: number;
    timestamp: string;
  }) {
    const room = `camera:${data.camera_id}`;
    const roomSize = this.server.sockets.adapter.rooms.get(room)?.size || 0;

    this.logger.debug(
      `Broadcasting frame #${data.frame_number} to room ${room} (${roomSize} clients)`,
    );

    if (roomSize === 0) {
      this.logger.warn(
        `No clients in room ${room}! Frame will not be delivered.`,
      );
    }

    this.server.to(room).emit('frame_update', data);
  }

  /**
   * Broadcast stream status changes
   */
  broadcastStreamStatus(data: {
    camera_id: string;
    camera_name: string;
    is_streaming: boolean;
    status: string;
  }) {
    this.logger.log(
      `Broadcasting stream status for camera ${data.camera_id}: ${data.status}`,
    );
    this.server.to(`camera:${data.camera_id}`).emit('stream_status', data);
    this.server.emit('camera_status_change', data); // Broadcast to all
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
