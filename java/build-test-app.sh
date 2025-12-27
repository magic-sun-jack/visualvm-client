#!/bin/bash

echo "========================================"
echo "构建测试应用程序"
echo "========================================"

cd "$(dirname "$0")"

echo "正在编译 Java 文件..."
javac -encoding UTF-8 TestApplication.java

if [ $? -ne 0 ]; then
    echo "编译失败！"
    exit 1
fi

echo "正在创建 JAR 文件..."
jar cvfe test-app.jar TestApplication TestApplication.class

if [ $? -ne 0 ]; then
    echo "JAR 文件创建失败！"
    exit 1
fi

echo "========================================"
echo "构建成功！"
echo "JAR 文件: test-app.jar"
echo "========================================"
echo ""
echo "运行方式:"
echo "  java -jar test-app.jar"
echo ""
echo "启用 JMX 远程连接:"
echo "  java -Dcom.sun.management.jmxremote \\"
echo "       -Dcom.sun.management.jmxremote.port=9010 \\"
echo "       -Dcom.sun.management.jmxremote.authenticate=false \\"
echo "       -Dcom.sun.management.jmxremote.ssl=false \\"
echo "       -jar test-app.jar"
echo ""

