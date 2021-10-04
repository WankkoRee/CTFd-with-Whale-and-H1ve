## CTFd with Whale and H1ve

本项目是由于历史遗留问题而产生的变通解决方案，实现了在装有`CTFd-Whale`的`CTFd 2.3.2`上使用`H1ve`主题。

因为校内平台已经在用远古版本`2.3.2`的`CTFd`，且已经有一些魔改，不太好平滑升级版本，但看着`H1ve`主题特别眼馋，所以花了一天时间把`H1ve`主题给适配到了老版本上，不过因为功能相关的代码在版本上差异过大，所以只是适配了主题，并没有作功能上的迁移。

## 相关项目

1. [CTFd/CTFd](https://github.com/CTFd/CTFd)
2. [glzjin/CTFd-Whale](https://github.com/glzjin/CTFd-Whale)
3. [D0g3-Lab/H1ve](https://github.com/D0g3-Lab/H1ve)

## 特性

1. CTFd原生主题汉化程度99%（前端`core`和后端`admin`）
2. 前端主题几乎完全汉化
3. 修复了主题的一些显示异常和不合理的视觉逻辑
4. 汉化主要针对校内平台，所以带有一些俏皮话和非通用称谓
5. 保证`CTFd-whale`的易用性

## 安装

1. 拉取项目

   ```shell
   git clone https://github.com/WankkoRee/CTFd-with-Whale-and-H1ve.git
   ```

2. 安装`docker`和`docker compose`

   由于不同系统的安装命令并不一样，请自行安装

3. 按需修改各种环境配置

   其中有对应关系的参数如下：

   1. `frp/frpc.ini`中的`token`应和`frp/frps.ini`中的`token`一致。
   2. `frp/frpc.ini`中的`server_addr`应和docker网络中宿主机的ip，通常为`172.1.0.1`。
   3. `frp/frpc.ini`中的`server_port`应和`frp/frps.ini`中的`bind_port`一致。
   4. `frp/frpc.ini`中的`admin_addr`应和`docker-compose.yml`中的`services.frpc.networks.frp.ipv4_address`以及`CTF-Whale`后台设置中的`Frp API IP`一致。
   5. `frp/frpc.ini`中的`admin_port`应和`CTF-Whale`后台设置中的`Frp API Port`一致。
   6. `frp/frps.ini`中的`vhost_http_port`在本项目中默认为`1638`，如有防火墙请在内网间放行。
   7. `frp/frps.ini`中的`subdomain_host`应和`CTF-Whale`后台设置中的`Frp Http Domain Suffix`一致。
   8. `CTF-Whale`后台设置中的`Frp Http Port`仅和前端的题目容器地址显示有关。
   9. 整个`frp/frpc.ini`文件内容应和`CTF-Whale`后台设置中的`Frp config template`一致。
   10. `CTF-Whale`后台设置中的`Docker Auto Connect Containers`应为`frpc`容器的名字，通常为`ctfd_frpc_1`。
   11. `CTF-Whale`后台设置中的`Docker Auto Connect Network`应为`frp_containers`网络的名字，通常为`ctfd_frp_containers`。
   12. `CTF-Whale`后台设置中的`Docker Swarm Nodes`通常为`linux-1`。

   本项目的动态题目容器配置基于域名访问和通过IP+端口访问，多容器子网因无需求未进行调试，如有需求请自行配置。

4. 启动项目

   ```shell
   cd CTFd-with-Whale-and-H1ve
   docker-compose up -d
   ```

5. 配置反向代理实现服务对用户透明化

   1. 将`abc.com`和`*.abc.com`解析至目标服务器（当然也可以是子域名，如`ctf.abc.com`和`*.ctf.abc.com`）
   2. 在`nginx`中，将`abc.com`反向代理至`http://127.0.0.1:8000`，其中端口应当和`docker-compose.yml`中的`services.ctfd.ports`一致。
   3. 在`nginx`中，将`*.abc.com`反向代理至`http://127.0.0.1:1638`，其中端口应当和`frp/frps.ini`中的`vhost_http_port`一致。
   4. 尝试访问`abc.com`，此时应当可以进入`CTFd`初始化页面。（请确保`80`和`443`端口已放行）
   5. 参照第3步配置好`CTFd-Whale`后，尝试启动容器题目，此时题目应当可以正常启动和访问。（首次启动需要拉取题目镜像，会稍慢）

