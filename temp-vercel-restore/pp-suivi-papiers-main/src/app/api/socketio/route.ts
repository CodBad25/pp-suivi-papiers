import { NextRequest } from 'next/server';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { setupSocket } from '@/lib/socket';

type NextApiResponseServerIO = {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

let io: SocketIOServer | undefined;

export async function GET(req: NextRequest) {
  if (!io) {
    console.log('Initializing Socket.IO server...');
    
    // Create a mock server for Vercel compatibility
    const httpServer = {
      on: () => {},
      emit: () => {},
      listen: () => {},
    } as any;
    
    io = new SocketIOServer(httpServer, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
    
    setupSocket(io);
    console.log('Socket.IO server initialized');
  }
  
  return new Response('Socket.IO server is running', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}