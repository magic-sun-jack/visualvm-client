# 测试应用程序使用说明

## 概述

`test-app.jar` 是一个用于系统功能测试的 Java 应用程序，可以产生 CPU、内存和线程活动，用于测试 VisualVM 客户端的监控功能。

## 构建

### Windows
```bash
build-test-app.bat
```

### Linux/Mac
```bash
chmod +x build-test-app.sh
./build-test-app.sh
```

## 运行方式

### 1. 本地模式（仅本地监控）

#### Windows
```bash
run-test-app.bat
```

#### Linux/Mac
```bash
java -jar test-app.jar
```

### 2. 远程模式（启用 JMX 远程连接）

#### Windows
```bash
run-test-app-remote.bat
```

#### Linux/Mac
```bash
chmod +x run-test-app-remote.sh
./run-test-app-remote.sh
```

或者手动运行：
```bash
java -Dcom.sun.management.jmxremote \
     -Dcom.sun.management.jmxremote.port=9010 \
     -Dcom.sun.management.jmxremote.authenticate=false \
     -Dcom.sun.management.jmxremote.ssl=false \
     -jar test-app.jar
```

## 功能特性

1. **CPU 负载**: 创建 10 个工作线程执行 CPU 密集型计算
2. **内存消耗**: 持续创建和释放内存对象（每个 1MB）
3. **线程创建**: 定期创建临时线程
4. **JMX 支持**: 支持通过 JMX 远程连接监控

## 在 VisualVM 客户端中使用

### 本地进程监控
1. 运行 `run-test-app.bat`（Windows）或 `java -jar test-app.jar`（Linux/Mac）
2. 在 VisualVM 客户端中，进程列表会自动显示该进程
3. 点击进程即可查看监控信息

### 远程进程监控
1. 运行 `run-test-app-remote.bat`（Windows）或 `run-test-app-remote.sh`（Linux/Mac）
2. 在 VisualVM 客户端中，打开"连接进程"对话框
3. 选择"远程连接"选项卡
4. 输入：
   - 主机地址: `localhost`（或远程服务器 IP）
   - 端口: `9010`
5. 点击"连接"即可监控远程进程

## 注意事项

- 应用程序会持续运行，直到按 `Ctrl+C` 停止
- 内存使用会自动控制，避免 OOM
- CPU 使用率会根据系统负载自动调整
- 远程连接时确保防火墙允许 9010 端口

## 故障排除

### 无法连接到远程进程
1. 检查 JMX 端口是否被占用
2. 检查防火墙设置
3. 确认 JVM 参数正确

### 编译失败
1. 确保已安装 JDK（Java Development Kit）
2. 检查 `javac` 和 `jar` 命令是否在 PATH 中
3. 确认 Java 版本 >= 8

