import fs from 'fs';
import readline from 'readline';

async function read() {
  console.log("call read()")
  const stream = fs.createReadStream('file.js')
  try {
    // rl是异步可迭代对象
    const rl = readline.createInterface({ input: stream });
    
    let lineCount = 0;
    // for...of 循环处理的是同步可迭代对象
    // for await...of则是处理异步的
    for await (const line of rl) {
        console.log(line);
        if (++lineCount >= 2) break;
    }
  } finally {
    stream.close();
    console.log("read OK");
  }
  
  stream.close();
}

//async函数返回的是一个Promise
read().catch(
    err => console.log(err)
)

console.log("--------------------")

// 不用 async/await 的写法
function read2() {
    console.log("call read2()")
    const stream = fs.createReadStream('file.js');
    
    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({ input: stream });
      let lineCount = 0;
  
      // 监听行事件
      const onLine = (line) => {
        console.log(line);
        if (++lineCount >= 2) {
          cleanup(); // 达到条件后清理
          resolve();
        }
      };
  
      // 统一错误处理
      const onError = (err) => {
        cleanup();
        reject(err);
      };
  
      // 资源清理函数
      const cleanup = () => {
        rl.off('line', onLine);   // 移除监听
        stream.off('error', onError);
        rl.close();               // 关闭 readline
        stream.close();           // 关闭流
      };
  
      // 绑定事件监听
      rl.on('line', onLine);
      stream.on('error', onError);
    });
  }
  
  // 调用示例
  read2()
    .then(() => console.log('read2 OK'))
    .catch(err => console.error('read2 err:', err));