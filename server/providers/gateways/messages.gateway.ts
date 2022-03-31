import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { GatewayAuthGuard } from '../guards/gatewayauth.guard';
import { JwtService } from '../services/jwt.service';
import { GatewayJwtBody } from 'server/decorators/gateway_jwt_body.decorator';
import { JwtBodyDto } from 'server/dto/jwt_body.dto';

class ChatMessagePayload {
  contents: string;
  userName: string;
  timestamp: number;
}

@WebSocketGateway()
@UseGuards(GatewayAuthGuard)
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: any, ...args: any[]) {
    try {
      console.log('Client connected');
      const jwt = client.handshake.auth.token;
      this.jwtService.parseToken(jwt);
      console.log(client.handshake.query);
      client.join(client.handshake.query.chatRoomId as unknown as string);
    } catch (e) {
      throw new WsException('Invalid token');
    }
  }

  handleDisconnect(client: any) {
    console.log('Client disconnected');
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ChatMessagePayload,
    @GatewayJwtBody() jwtBody: JwtBodyDto,
  ) {
    let message = {
      contents: null,
      userName: null,
      chatRoomId: null,
      timestamp: null,
    };
    message.contents = payload.contents;
    message.userName = payload.userName;
    message.chatRoomId = parseInt(client.handshake.query.chatRoomId as unknown as string, 10);
    message.timestamp = payload.timestamp;
    this.server.to(`${message.chatRoomId}`).emit('message', message);
  }
}