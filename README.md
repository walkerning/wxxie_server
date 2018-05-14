development指导
------------

### 环境变量

现在的代码里, 在不同的mode下运行, 会读一些环境变量; 环境变量列表和解释见 [`sample_env.sh`](./sample_env.sh)

### 运行API dev server

**依赖**

* 安装mysql, node, npm等;
* ``mysql -u root -p < scripts/create_database.sql``: 把用于development和test的数据库以及账户创建; 数据库链接的配置在``src/config/database.js``;
* ``npm install -g grunt-cli``
* ``npm install`` 安装项目依赖;

**运行**

* ``NODE_ENV=development grunt database``: 初始化数据库: 建立表格, 插入实验数据;
* ``WXXIE_NOWECHAT=1 grunt dev``: 运行development server; ``WXXIE_NOWECHAT``解释见 [`sample_env.sh`](./sample_env.sh)

### 测试server API的方法

使用`httpie`命令行工具来测试server API. Python测试脚本 `uphttp` 是为了方便, 针对我们应用的测试接口, 对`httpie`简单封装了一下. 

**安装依赖**
```
sudo apt install python-yaml python-pip
pip install -r test_requirements.txt
```

**用例**
```
./uphttp --help                                # 查看简要帮助
./uphttp config set host=http://localhost:3000 # host包括你本机dev server监听的ip和port
./uphttp config set username=root              # 做完数据库migration/initdb后, 默认创建的root user
./uphttp config set password=ASTARTPASSORD     # 做完数据库migration/initdb后, 默认root user的密码
./uphttp login                                 # 使用用户名密码登录, 获取并存储token
./uphttp config list                           # 可以看到现在有的config, 包括获取的token
./uphttp do GET /users                         # 访问用户列表API. HTTP verbs 大小写不敏感
./uphttp do POST /users userName=ceshi password=ceshi12345 nickName=ceshi gender=1 # 创建新用户API
```

可以尝试用新用户登录, 会失败; 因为默认登录方法现在是微信登陆; 所以能用用户名密码登陆是需要额外的权限: `login_userpass`; 权限管理的API接口暂时还没写.
```
$ ./uphttp login --username ceshi --password ceshi12345
{
    "message": "此用户不支持 userpass 登录方式",
    "name": "UnauthorizedError",
    "trace": {
        "message": "此用户不支持 userpass 登录方式",
        "name": "UnauthorizedError",
        "status": 401
    }
}
AssertionError: Do not success get the token
```

`uphttp`只是对`httpie`简单的封装了一下:
- 不用每次拷贝token
- 不用每次输入一些重复的参数和Header,
- 可以不输入host path, 只需要输入相对于`<HOST>/api/v1`的path. 

除此之外的其它的参数都是传给httpie的, 所以, 可以看一眼 [httpie](https://github.com/jakubroztocil/httpie) 的文档了解更多的`httpie`的用法.

API
------------

见[API文档](new_api.md)