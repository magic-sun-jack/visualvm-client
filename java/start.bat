@echo off
cd /d "%~dp0"
java -Dfile.encoding=UTF-8 --add-modules=jdk.attach -jar monitor-0.0.1-SNAPSHOT.jar
pause