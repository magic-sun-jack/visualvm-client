# 使用官方 OpenJDK 11 运行时作为基础镜像
FROM adoptopenjdk:11-jdk-hotspot

# 设置工作目录
WORKDIR /app

# 复制 JAR 文件到容器中
COPY monitor-0.0.1-SNAPSHOT.jar app.jar

# 暴露应用端口（根据您的应用配置调整）
EXPOSE 8099

# 设置 JVM 参数和启动命令
ENTRYPOINT ["java", "-jar", "app.jar"]