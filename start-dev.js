import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function startDevelopment() {
  console.log('🚀 Starting Hotel PMS Development Environment...\\n');
  
  try {
    // Wait a bit for server to start, then seed rooms
    setTimeout(async () => {
      try {
        console.log('🌱 Seeding database with sample rooms...');
        const { stdout } = await execAsync('curl -X POST http://localhost:5000/api/rooms/seed');
        console.log('✅ ' + stdout);
        console.log('\\n🎉 Hotel PMS is ready!');
        console.log('   Frontend: http://localhost:5173');
        console.log('   Backend:  http://localhost:5000');
      } catch (error) {
        console.log('⚠️  Could not seed rooms (server might still be starting)');
      }
    }, 3000);

    // Start both client and server
    console.log('Starting client and server concurrently...\\n');
    await execAsync('npx concurrently "cd server && npm run dev" "cd client && npm run dev"', { stdio: 'inherit' });
    
  } catch (error) {
    console.error('Error starting development environment:', error);
  }
}

startDevelopment();
