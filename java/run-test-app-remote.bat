@echo off
cd /d "%~dp0"

echo ========================================
echo 运行测试应用程序（启用 JMX 远程连接）
echo ========================================
echo JMX 端口: 9010
echo 连接地址: localhost:9010
echo ========================================
echo.

java -Dcom.sun.management.jmxremote ^
     -Dcom.sun.management.jmxremote.port=9010 ^
     -Dcom.sun.management.jmxremote.authenticate=false ^
     -Dcom.sun.management.jmxremote.ssl=false ^
     -jar test-app.jar

pause

