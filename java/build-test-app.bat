@echo off
echo ========================================
echo 构建测试应用程序
echo ========================================

cd /d "%~dp0"

echo 正在编译 Java 文件...
javac -encoding UTF-8 TestApplication.java

if %ERRORLEVEL% NEQ 0 (
    echo 编译失败！
    pause
    exit /b 1
)

echo 正在创建 JAR 文件...
jar cvfe test-app.jar TestApplication TestApplication.class

if %ERRORLEVEL% NEQ 0 (
    echo JAR 文件创建失败！
    pause
    exit /b 1
)

echo ========================================
echo 构建成功！
echo JAR 文件: test-app.jar
echo ========================================
echo.
echo 运行方式:
echo   java -jar test-app.jar
echo.
echo 启用 JMX 远程连接:
echo   java -Dcom.sun.management.jmxremote ^
echo        -Dcom.sun.management.jmxremote.port=9010 ^
echo        -Dcom.sun.management.jmxremote.authenticate=false ^
echo        -Dcom.sun.management.jmxremote.ssl=false ^
echo        -jar test-app.jar
echo.
pause

