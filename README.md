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

3. 启用 Docker Swarm

   ```shell
   docker swarm init
   docker node update --label-add name=linux-1 $(docker node ls -q)
   ```

4. 按需修改各种环境配置

   其中有对应关系的参数如下：

   1. `config/frp/frpc.ini`中的`token`应和`config/frp/frps.ini`中的`token`一致。
   2. `config/frp/frpc.ini`中的`server_addr`应和`frp-server`容器的ip一致，通常为`172.1.0.4`。
   3. `config/frp/frpc.ini`中的`server_port`应和`config/frp/frps.ini`中的`bind_port`一致。
   6. `config/frp/frps.ini`中的`vhost_http_port`在本项目中默认为`1638`，如有防火墙请在内网间放行。

   本项目的动态题目容器配置基于域名访问和通过IP+端口访问，多容器子网因无需求未进行调试，如有需求请自行配置。

5. 启动项目

   ```shell
   cd CTFd-with-Whale-and-H1ve
   docker-compose up -d
   ```

6. 配置反向代理实现服务对用户透明化

   1. 将`abc.com`和`*.abc.com`解析至目标服务器（当然也可以是子域名，如`ctf.abc.com`和`*.ctf.abc.com`）
   2. 在`nginx`中，将`abc.com`反向代理至`http://127.0.0.1:8000`，其中端口应当和`docker-compose.yml`中的`services.ctfd.ports`一致。
   3. 在`nginx`中，将`*.abc.com`反向代理至`http://127.0.0.1:1638`，其中端口应当和`config/frp/frps.ini`中的`vhost_http_port`一致。
   4. 尝试访问`abc.com`，此时应当可以进入`CTFd`初始化页面。（请确保`80`和`443`端口已放行）
   5. 参照下表配置好`CTFd-Whale`后，尝试启动容器题目，此时题目应当可以正常启动和访问。（首次启动需要拉取题目镜像，会稍慢）

      | 参数                                               | 推荐值                          | 参考来源                                                                                                                                             |
      |--------------------------------------------------|------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
      | Flag Format                                      | `flag{%s}`                   | flag 格式, 参考其他比赛的规则                                                                                                                               |
      | Docker API URL                                   | `unix://var/run/docker.sock` | [docker-compose.yml](docker-compose.yml)`.services[ctfd]`能够访问到的 Docker API                                                                       |
      | Frp API IP                                       | `172.1.0.3`                  | [docker-compose.yml](docker-compose.yml)`.services[frp-client].networks[frp].ipv4_address`, [frpc.ini](config/frp/frpc.ini)`[common].admin_addr` |
      | Frp API Port                                     | `7400`                       | [docker-compose.yml](docker-compose.yml)`.services[frp-client].expose[0]`, [frpc.ini](config/frp/frpc.ini)`[common].admin_port`                  |
      | Frp Http Domain Suffix                           | `.abc.com`                   | [frps.ini](config/frp/frps.ini)`[common].subdomain_host`                                                                                         |
      | Frp Http Port                                    | `80`/`1638`                  | 在题目使用http转发时，会在前台显示的端口，不依赖于其他配置                                                                                                                  |
      | Frp Direct IP Address                            | 机器外网IP                       | 在题目使用直接转发时，会在前台显示的IP，不依赖于其他配置                                                                                                                    |
      | Frp Direct Minimum Port                          | `30000`                      | 在题目使用直接转发时，最小可能分配的端口，确认其他已有端口不包含在内即可, [docker-compose.yml](docker-compose.yml)`.services[frp-server].ports`                                      |
      | Frp Direct Maximum Port                          | `31000`                      | 在题目使用直接转发时，最大可能分配的端口，确认其他已有端口不包含在内即可, [docker-compose.yml](docker-compose.yml)`.services[frp-server].ports`                                      |
      | Max Container Count                              | 视题目负载压力及机器性能决定               | 最大能同时开多少个容器，确认机器性能足够就行                                                                                                                           |
      | Max Renewal Times                                | 视比赛规则决定                      | 题目续期次数，参考其他比赛的规则                                                                                                                                 |
      | Frp config template                              | 与整个`frpc.ini`文件一致即可          | [frpc.ini](config/frp/frpc.ini)                                                                                                                  |
      | Docker Auto Connect Containers                   | `ctfd-frp-client-1`          | 与`frp-client`容器的运行时名字一致即可                                                                                                                        |
      | Docker Auto Connect Network                      | `ctfd_frp_containers`        | 与`frp_containers`网络的运行时名字一致即可                                                                                                                    |
      | Docker Dns Setting                               | `None`                       | 大部分时候用不到                                                                                                                                         |
      | Docker Swarm Nodes                               | `linux-1`                    | 配置 Docker Swarm 时设置的 Node label name                                                                                                             |
      | Docker Multi-Container Network Subnet            | `174.1.0.0/16`               | 多容器题目配置项，未测试                                                                                                                                     |
      | Docker Multi-Container Network Subnet New Prefix | `24`                         | 多容器题目配置项，未测试                                                                                                                                     |
      | Docker Container Timeout                         | 视比赛规则决定                      | 题目有效时间，参考其他比赛的规则                                                                                                                                 |
