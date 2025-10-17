public class DeadlockExample {
    static class Resource {
        private final String name;
        public Resource(String name) {
            this.name = name;
        }
        public String getName() {
            return name;
        }
    }
    public static void main(String[] args) {
        final Resource resourceA = new Resource("ResourceA");
        final Resource resourceB = new Resource("ResourceB");

        // 线程1尝试先锁 resourceA 再锁 resourceB
        Thread thread1 = new Thread(() -> {
            synchronized (resourceA) {
                System.out.println("Thread 1 get " + resourceA.getName());
                try {
                    Thread.sleep(100); // 模拟处理
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                synchronized (resourceB) {
                    System.out.println("Thread 1 get " + resourceB.getName());
                }
            }
        });
        // 线程2尝试先锁 resourceB 再锁 resourceA
        Thread thread2 = new Thread(() -> {
            synchronized (resourceB) {
                System.out.println("Thread 2 get " + resourceB.getName());
                try {
                    Thread.sleep(100); // 模拟处理
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                synchronized (resourceA) {
                    System.out.println("Thread 2 get " + resourceA.getName());
                }
            }
        });
        thread1.start();
        thread2.start();
    }
}