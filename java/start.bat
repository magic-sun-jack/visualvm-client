@echo off
cd /d "%~dp0"
java --add-modules jdk.attach --add-exports jdk.attach/sun.tools.attach=ALL-UNNAMED -jar monitor-0.0.1-SNAPSHOT.jar
pause