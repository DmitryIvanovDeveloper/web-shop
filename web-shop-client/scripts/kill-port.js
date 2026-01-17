const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const port = process.argv[2] || '3001';

async function killPort(port) {
  const isWindows = process.platform === 'win32';
  
  try {
    if (isWindows) {
      // Windows: найти PID процесса на порту и убить его
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      
      if (!stdout.trim()) {
        console.log(`Порт ${port} свободен`);
        return;
      }
      
      // Извлечь PID из вывода netstat
      const lines = stdout.trim().split('\n');
      const pids = new Set();
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(pid)) {
          pids.add(pid);
        }
      }
      
      // Убить все процессы
      for (const pid of pids) {
        try {
          await execAsync(`taskkill /F /PID ${pid}`);
          console.log(`Процесс ${pid} на порту ${port} завершен`);
        } catch (error) {
          // Процесс может уже завершиться
          if (!error.message.includes('не найден')) {
            console.warn(`Не удалось завершить процесс ${pid}:`, error.message);
          }
        }
      }
    } else {
      // Unix/Linux/Mac: использовать lsof
      try {
        const { stdout } = await execAsync(`lsof -ti:${port}`);
        const pids = stdout.trim().split('\n').filter(Boolean);
        
        if (pids.length === 0) {
          console.log(`Порт ${port} свободен`);
          return;
        }
        
        for (const pid of pids) {
          try {
            await execAsync(`kill -9 ${pid}`);
            console.log(`Процесс ${pid} на порту ${port} завершен`);
          } catch (error) {
            console.warn(`Не удалось завершить процесс ${pid}:`, error.message);
          }
        }
      } catch (error) {
        // lsof возвращает ошибку, если порт свободен
        if (error.message.includes('No such file or directory') || 
            error.stdout === '') {
          console.log(`Порт ${port} свободен`);
          return;
        }
        throw error;
      }
    }
  } catch (error) {
    // Игнорируем ошибки, если порт уже свободен
    if (!error.message.includes('findstr') && 
        !error.message.includes('lsof') &&
        !error.stdout) {
      console.warn(`Ошибка при проверке порта ${port}:`, error.message);
    }
  }
}

killPort(port).catch(console.error);

