==============
常见问题
==============

zadig安装失败,出现Driver Installation: Failed (Could not allocate resource)
    | 可以打开“选项”，选择“高级模式”，查看错误原因，根据错误原因解决。
    | 有可能我们会发现installer-x64.exe被锁定了，直接删除C:\Users\<your user name>\usb_driver\，再重新运行zadig安装即可。

找不到dll
    如果出现vcruntime.dll等dll找不到的问题，请先安装vc-redist
