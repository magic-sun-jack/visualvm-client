import java.lang.management.ManagementFactory;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 用于系统功能测试的 Java 应用程序
 * 可以产生 CPU、内存和线程活动，用于测试监控功能
 */
public class TestApplication {
    private static final int THREAD_COUNT = 10;
    private static final int MEMORY_OBJECTS = 1000;
    private static final AtomicLong counter = new AtomicLong(0);
    private static volatile boolean running = true;
    private static List<byte[]> memoryObjects = new ArrayList<>();
    private static ExecutorService executorService = Executors.newFixedThreadPool(THREAD_COUNT);
    
    public static void main(String[] args) {
        System.out.println("========================================");
        System.out.println("测试应用程序启动");
        System.out.println("========================================");
        
        // 打印进程信息
        String pid = ManagementFactory.getRuntimeMXBean().getName().split("@")[0];
        System.out.println("进程 PID: " + pid);
        System.out.println("Java 版本: " + System.getProperty("java.version"));
        System.out.println("Java Home: " + System.getProperty("java.home"));
        System.out.println("主类: " + TestApplication.class.getName());
        System.out.println("========================================");
        
        // 启动内存消耗线程
        startMemoryConsumer();
        
        // 启动 CPU 密集型任务
        startCpuIntensiveTasks();
        
        // 启动线程创建任务
        startThreadCreator();
        
        // 注册关闭钩子
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("\n正在关闭应用程序...");
            running = false;
            executorService.shutdown();
            System.out.println("应用程序已关闭");
        }));
        
        // 主线程保持运行
        try {
            System.out.println("\n应用程序正在运行，按 Ctrl+C 停止...");
            while (running) {
                Thread.sleep(5000);
                long count = counter.get();
                System.out.println("运行时间: " + (count / 2) + " 秒, 总操作数: " + count);
            }
        } catch (InterruptedException e) {
            System.out.println("主线程被中断");
        }
    }
    
    /**
     * 启动内存消耗线程
     */
    private static void startMemoryConsumer() {
        executorService.submit(() -> {
            Random random = new Random();
            while (running) {
                try {
                    // 创建一些对象消耗内存
                    byte[] data = new byte[1024 * 1024]; // 1MB
                    random.nextBytes(data);
                    memoryObjects.add(data);
                    
                    // 限制内存对象数量，避免 OOM
                    if (memoryObjects.size() > MEMORY_OBJECTS) {
                        memoryObjects.remove(0);
                    }
                    
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        });
    }
    
    /**
     * 启动 CPU 密集型任务
     */
    private static void startCpuIntensiveTasks() {
        for (int i = 0; i < THREAD_COUNT; i++) {
            final int threadId = i;
            executorService.submit(() -> {
                Random random = new Random();
                while (running) {
                    // CPU 密集型计算
                    long sum = 0;
                    for (int j = 0; j < 100000; j++) {
                        sum += random.nextInt(100);
                    }
                    counter.incrementAndGet();
                    
                    // 偶尔休眠，避免 CPU 100%
                    if (threadId % 3 == 0) {
                        try {
                            Thread.sleep(10);
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                            break;
                        }
                    }
                }
            });
        }
    }
    
    /**
     * 启动线程创建任务
     */
    private static void startThreadCreator() {
        executorService.submit(() -> {
            while (running) {
                try {
                    // 创建一些临时线程
                    for (int i = 0; i < 5; i++) {
                        Thread tempThread = new Thread(() -> {
                            try {
                                Thread.sleep(2000);
                            } catch (InterruptedException e) {
                                Thread.currentThread().interrupt();
                            }
                        });
                        tempThread.start();
                    }
                    Thread.sleep(5000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        });
    }
}

