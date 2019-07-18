set /a startS=%time:~6,2%  
set /a startM=%time:~3,2%  
echo %time% 
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png ./
adb shell rm /sdcard/screenshot.png
set /a endS=%time:~6,2%  
set /a endM=%time:~3,2%  
echo %time%  
set /a diffS_=%endS%-%startS%  
set /a diffM_=%endM%-%startM%  
echo cost:%diffM_% %diffS_%   
pause  