const { execSync } = require('child_process');
const os = require('os');

const port = process.argv[2] || '3000';

function killPort(port) {
  const platform = os.platform();
  
  try {
    if (platform === 'win32') {
      // Windows
      const command = `netstat -ano | findstr :${port}`;
      const result = execSync(command, { encoding: 'utf-8' });
      
      if (result.trim()) {
        const lines = result.trim().split('\n');
        const pids = new Set();
        
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(pid)) {
            pids.add(pid);
          }
        });
        
        pids.forEach(pid => {
          try {
            execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
            console.log(`Killed process ${pid} on port ${port}`);
          } catch (error) {
            // Process might already be terminated
          }
        });
      } else {
        console.log(`No process found on port ${port}`);
      }
    } else {
      // Unix-like (Linux, macOS)
      const command = `lsof -ti:${port}`;
      try {
        const pids = execSync(command, { encoding: 'utf-8' }).trim().split('\n');
        pids.forEach(pid => {
          if (pid) {
            try {
              execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
              console.log(`Killed process ${pid} on port ${port}`);
            } catch (error) {
              // Process might already be terminated
            }
          }
        });
      } catch (error) {
        console.log(`No process found on port ${port}`);
      }
    }
  } catch (error) {
    // Port might not be in use, which is fine
    console.log(`Port ${port} is not in use`);
  }
}

killPort(port);


