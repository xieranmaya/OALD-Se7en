# OALD Se7en

A Chrome App.

You can found it here:

https://chrome.google.com/webstore/detail/oald-7-%E7%89%9B%E6%B4%A5%E9%AB%98%E9%98%B6%E7%AC%AC%E4%B8%83%E7%89%88/nmdnfeohnddmdmknpjbmnknkmkpcehhn

## 目前由于种种原因，本App已在Chrome Web Store下架，下面介绍安装方法

1. 点击[本页](https://github.com/xieranmaya/OALD-Se7en)右侧的“[Downolad ZIP](https://github.com/xieranmaya/OALD-Se7en/archive/master.zip)”下载程序的ZIP包，然后解压到任何一个地方，得到OALD-Se7en文件夹
2. 打开Chrome扩展管理页面：地址栏输入chrome://extensions/或者先进入设置，然后从左侧边栏选择“扩展程序”
3. 勾选扩展页面顶部的“开发者模式”选项，勾选后会在下方立即出现三个按钮
4. 选择第一个按钮“加载正在开发的扩展程序”
5. 在弹出的对话框中选择刚刚解压出来的“OALD-Se7en”文件夹
6. 之后就自动进入安装流程
7. 建议最好不要把OALD-Se7en文件夹放在桌面上，而是放入一个不经常动的文夹，因为按以上方式安装后就不再需要动这个文件夹了



## 如何备份之前从Chrome Web Store安装的版本里的生词/历史/来源等数据？

1. 以Windows 7为例，假设Chrome安装位置为默认，打开如下文件夹
`C:\Users\你的用户名\AppData\Local\Google\Chrome\User Data\Default\databases\chrome-extension_nmdnfeohnddmdmknpjbmnknkmkpcehhn_0`（这里最后一位数字可能不一样，但前面的nmdnfeoh这些肯定是一样的，这是App的ID）
2. 里面有一个以数字命名的文件（也有可能有多个，一般应该是一个），大小在80M左右，备份这个文件
3. 按前述方法以开发者模式安装软件后（注意是成功安装后），在扩展程序界面观察新安装的版本的ID（因为每个人安装的ID很可能不一样，所以此处无法举例），然后打开 `C:\Users\你的用户名\AppData\Local\Google\Chrome\User Data\Default\databases\chrome-extension_新的ID_0` 文件夹，这时先关闭Chrome(菜单的最后一项目`退出`)，然后删除该文件夹里的文件，把刚刚备份的文件复制进来，再打开Chrome，就可以了

