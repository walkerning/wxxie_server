需求分析
============
### 用户操作流程

#### 用户登录
用户登录 -> 用户主页(任务列表)

#### 新建任务

**NOTE**: 有没有可能不同球鞋型号也会决定不同的模板...如果是这样的话...是不是要先任务类型和球鞋型号

任务列表 -> 新建任务 -> [optional: 需要选择任务的meta_tag] -> (选择球鞋型号, 拍照, 填写备注) -> 发布任务

#### 查看任务结果

```
任务列表(可下拉刷新)   -+
                        |\
                        ------> 查看任务
                        |/
消息推送(新的检测结果) -+
```

#### 修改未完成任务

```
任务列表 -> 选择任务 -> (选择球鞋型号, 拍照, 填写备注) -> 发布任务
```

**NOTE**: 暂时不支持暂存任务功能

Resources
============

* `required`: 必须返回的字段
* `optional`: 可以省略/不存在的字段
* `expandable`: 可扩展的字段(都对应数据库里的外键)
* `queryable`: 可查询的字段

### 用户 User

```javascript
{
  // Integer[required]: 用户Id
  "id": "2",
  // String[optional]: 用户名
  "userName": "",
  // String[required]: openID
  "openId": "...",
  // String[required]: 用户昵称
  "nickName": "球球君",
  // Integer[required,queryable]: 性别. 0/1/2/3 分别代表 未填/男/女/其他
  "gender": 2,
  // String[optional,queryable]: 城市
  "city": "",
  // String[optional,queryable]: 省份
  "province": "",
  // String[optional,queryable]: 国家
  "country": "",
  // String[optional]: 用户邮箱
  "email": "",
  // String[optional]: 用户手机
  "phone": "",
  // Integer[required,queryable]: 用户可拥有的task上限
  "quota": 10,
  // Array(String)[required]: 该用户的权限列表:
  "permissions": [],

  // String[required,queryable]: 该用户创建的时间(ISO format)
  "created_at": "2017-09-01T10:54:24.738793",
  // String[optional,queryable]: 该用户信息更新时间(ISO format)
  "updated_at": "2017-09-01T10:54:24.738793"
}
```

### 权限 Permission

```javascript
{
  // Integer[required]: 权限Id
  "id": 1
  // String[required]: 权限名字
  "name": "user",
  // String[required]: 权限描述
  "description": "用户管理权限",

  // String[required,queryable]: 该权限创建的时间(ISO format)
  "created_at": "2017-09-01T10:54:24.738793",
  // String[optional,queryable]: 该权限信息更新时间(ISO format)
  "updated_at": "2017-09-01T10:54:24.738793"
}
```

### 球鞋品牌 Brand

```javascript
{
  // Integer[required]: 品牌Id
  "id": 1,
  // String[required]: 品牌图片文件请求路径
  "image": "/static/pics/brands/adidas/9f8ca811a2827ddb8f10775c0163233ca6cd2572.png",
  // String[required]: 品牌名
  "name": "adidas",
  // String[required]: 品牌展示名
  "show_name": "Adidas",
  // String[required]: 品牌描述
  "description": "阿迪达斯品牌成立于blabla",
  // String[required,queryable]: 品牌状态: no/testing/supported表示 还未支持/内测/已经开放支持
  "state": "no",

  // String[optional,queryable]: 该品牌开始支持的时间(ISO format)
  "supported_at": "2017-09-01T10:54:24.738793",
  // String[required,queryable]: 该品牌创建的时间(ISO format)
  "created_at": "2017-09-01T10:54:24.738793",
  // String[optional,queryable]: 该品牌信息更新时间(ISO format)
  "updated_at": "2017-09-01T10:54:24.738793"
}
```

### 位置 Position

```javascript
{
  // Integer[required]: 位置id
  "id": 2,
  // String[required]: 位置名
  "name": "appear",
  // String[required]: 位置展示名
  "show_name": "球鞋外观",
  // String[required]: 位置描述
  "description": "球鞋的侧面整体图片",
  // String[required]: 位置模版图请求路径
  "image": "/static/pics/templates/4cd04e251a92f9919a8b6ed76a9a1664aede694e.png",
  // String[required]: 位置示例图请求路径
  "example_image": "/static/pics/templates/2e01d694966a1e5fbf111374e772ba0167b5f3e2.png",

  // String[required,queryable]: 该位置创建的时间(ISO format)
  "created_at": "2017-09-01T10:54:24.738793",
  // String[optional,queryable]: 该位置信息更新时间(ISO format)
  "updated_at": "2017-09-01T10:54:24.738793"
}
```

### 球鞋型号 ShoeModel

```javascript
{
  // Integer[required]: 鞋型Id
  "id": 1,
  // String[required]: 鞋型图片文件请求路径
  "image": "/static/pics/brands/adidas/superstar_e69fd3fef3683dc556c85527d32bdc382af8c4dc.png",
  // String[required]: 鞋型名
  "name": "adidas",
  // String[required]: 鞋型展示名
  "show_name": "Adidas",
  // String[required]: 鞋型描述
  "description": "阿迪达斯SuperStar是blabla",
  // String[required]: 鞋型状态: no/testing/supported表示 还未支持/内测/已经开放支持
  "state": "testing",
  // Array(Position)[required]: 此款鞋型需要拍照的位置列表
  "positions": [
    {
      // Integer[required]: 位置id
      "id": 2,
      // String[required]: 位置名
      "name": "appear",
      // String[required]: 位置展示名
      "show_name": "球鞋外观",
      // String[required]: 位置模版图请求路径
      "image": "/static/pics/templates/4cd04e251a92f9919a8b6ed76a9a1664aede694e.png",
      // String[required]: 位置示例图请求路径
      "example_image": "/static/pics/templates/2e01d694966a1e5fbf111374e772ba0167b5f3e2.png"
    }
  ],
  // Integer[required,expandable]: 品牌Id
  "brand_id": 1
}
```

### 任务 Task

```javascript
{
  // String[required]: reserved...
  "meta_tag": "v0.1",

  // Integer[required,expandable,queryable]: 球鞋型号id
  "shoe_model_id": 3,
  // Int[required,expandable,queryable]: 任务所属用户Id
  "user_id": 2,

  // String[required]: 任务名
  "task_name": "求帮鉴定新买的阿迪达斯",
  // String[required]: 鞋的新旧类型: new/old
  "type": "new",
  // String[required]: 鞋的购买渠道: Physical/Tmall/JD/Taobao/Other 分别代表 实体店/天猫/京东/淘宝/其它
  "buy_type": "Taobao",
  // String[optional]: 如果鞋的购买渠道是Other, 可以填这个
  "buy_other_type": ""
  // String[required]: 购买店名
  buy_name: "xxx体育用品专卖店"
  // String[optional]: 备注
  "comment": "",
  // String[optional]: 表单id
  "form_id": "",

  // String[required]: 当前用户对该荣誉的申请状况, incomplete/waiting/finished/failed 分别代表
  //                   未完全/等待中/已完成/任务失败
  "state": "incomplete",
  // String[optional]: 运行记录, 在debug/test模式部署的服务器才返回
  "log": "",
  // String[optional]: 鉴定结果, [null, undefined]/fake/not_sure/true
  "answer": null,

  // String[required]: 该任务创建的时间(ISO format)
  "created_at": "2017-09-01T10:54:24.738793",
  // String[optional]: 该任务开始等待的时间(ISO format)
  "start_time": "2017-09-01T10:54:24.738793",
  // String[optional]: 该任务完成的时间(ISO format)
  "finish_time": "2017-09-01T10:54:24.738793"
}
```

API
============

### 用户相关

* ``GET /api/v1/users``: 得到用户列表
  * **权限**: 用户管理
  * **返回**: [User]
* ``POST /api/v1/users``: 创建用户名/密码登陆用户, 创建的用户暂时是用于测试. 因为openId是mock的, 不能通过wafer认证. TODO: 之后可以支持用户给自己的用户名密码用户绑定微信号/或者给微信小程序登录的用户设定用户名密码
  * **权限**: 用户管理
  * **返回**: User

* ``GET /api/v1/users/me``: 得到自己用户信息
  * **权限**:
  * **返回**: User
* ``GET /api/v1/users/{userId}``: 得到`userId`用户信息
  * **权限**: 用户管理 OR `userId == me`
  * **返回**: User
* ``PUT /api/v1/users/{userId}``: 修改`userId`的用户信息
  * **权限**: 用户管理 OR `userId == me`
  * **返回**: User

### 权限相关

* ``GET /api/v1/permissions``: 得到权限列表
  * **权限**: 权限管理
  * **返回**: [Permission]
* ``GET /api/v1/permissions/{permissionName}/users``: 得到拥有某权限的用户列表 
  * **权限**: 权限管理
  * **返回**: [Users]
* POST /api/v1/permissions/{permissionName}/users: 给某个用户加入权限
  * **参数**: `userId`=需要加入权限的user的id
  * **权限**: 权限管理
  * **返回**:
* DELETE /api/v1/permissions/{permissionName}/users/{userId}: 删除某个用户的某个权限
  * **权限**: 权限管理
  * **返回**:

### 品牌相关

* ``GET /api/v1/brands``: 得到品牌列表
  * **权限**: 品牌管理
  * **返回**: [Brand]
* ``POST /api/v1/brands``: 创建品牌
  * **权限**: 品牌管理
  * **返回**: Brand
* ``GET /api/v1/brands/{brandId}``: 得到`brandId`品牌信息
  * **权限**: 品牌管理
  * **返回**: Brand
* ``PUT /api/v1/brands/{brandId}``: 修改`brandId`的品牌信息
  * **权限**: 品牌管理
  * **返回**: Brand
* ``DELETE /api/v1/brands/{brandId}``: 删除`brandId`品牌
  * **权限**: 品牌管理
  * **返回**:

### 鞋型相关

* ``GET /api/v1/brands/{brandId}/shoe_models``: 得到`brandId`品牌的鞋型列表
  * **权限**: 品牌管理
  * **返回**: [ShoeModel]
* ``POST /api/v1/brands/{brandId}/shoe_models``: 创建鞋型
  * **权限**: 品牌管理
  * **返回**: ShoeModel
* ``GET /api/v1/brands/{brandId}/shoe_models/{shoe_modelId}``: 得到`shoe_modelId`鞋型信息
  * **权限**: 品牌管理
  * **返回**: ShoeModel
* ``PUT /api/v1/brands/{brandId}/shoe_models/{shoe_modelId}``: 修改`shoe_modelId`的鞋型信息
  * **权限**: 品牌管理
  * **返回**: ShoeModel
* ``DELETE /api/v1/brands/{brandId}/shoe_models/{shoe_modelId}``: 删除`shoe_modelId`鞋型
  * **权限**: 品牌管理
  * **返回**:

### 任务相关

* ``GET /api/v1/tasks``: 得到task列表
  * **权限**: 任务管理
  * **返回**: [Task]

### 用户任务相关

* ``GET /api/v1/users/{userId}/tasks``: 得到某个`userId`的用户的所有task的列表
  * **权限**: (用户管理 AND 任务管理) OR ``userId == me``
  * **返回**: [Task]
* ``POST /api/v1/users/{userId}/tasks``: 创建一个新task
  * **权限**: ``userId == me``
  * **条件**: ``len(user.tasks) < user.quota``
  * **返回**: Task
* ``PUT /api/v1/users/{userId}/tasks/{taskId}``: 修改任务信息, 不能改state
  * **权限**: ``userId == me``
  * **条件**: ``task.state == "incomplete"``
  * **返回**: Task
* ``PUT /api/v1/users/{userId}/tasks/{taskId}/admin``: 修改任务信息
  * **权限**: 用户管理 AND 任务管理
  * **返回**: Task
* ``PUT /api/v1/users/{userId}/tasks/{taskId}/run``: 开始run一个task, 会检查是否这个任务, 需要满足的条件是否已经满足, 如果task已经在waiting/finished状态直接返回.
  * **权限**: ``userId == me``
  * **返回**: Task
* ``DELETE /api/v1/users/{userId}/tasks/{taskId}``: 删除任务
  * **权限**: 用户管理 AND 任务管理
  * **返回**:

* ``POST /api/v1/users/{userId}/tasks/{taskId}/files``: 上传一个task的文件
  * **权限**: ``userId == me``
  * **条件**: ``task.state == "incomplete"``
  * **返回**:
* ``GET /api/v1/users/{userId}/tasks/{taskId}/files/{positionName}``: 下载userId用户taskId任务的对应positionName的文件
  * **权限**: (用户管理 AND 任务管理) OR ``userId == me``
  * **返回**: 如果文件不存在

### 认证相关

#### 登录/认证方式和流程

* 微信小程序: 
  * 小程序端将`code`发送给API
  * API的wafer中间件使用`code`, `appId`, `app_secret` 向微信服务器获取用户 `openId` 和 `session_key`
  * API的wafer中间件用 `session_key` 生成 `skey` 和 `sid`,使用 `sid` 作为键值 `session_key` 和 `user_info` 等作为value 存在 session store 里 (expire默认1天); 把并把`skey`和`sid`两个信息传回给小程序前端
  * 小程序前端会在接下来的请求的HEADER里带上`skey`和`sid`, 在该session过期之前, APIwafer都不需要重新给微信服务器发起登陆请求.

* 用户名密码登录(with JWT token for now): 现在主要用于服务器端测试使用
  * 客户端使用login point `POST /login` 提供用户名 `userName` 和 `password`.
  * API验证:
    * `userName`, `password`均不为空
    * 存在该`userName`的用户
    * 该用户的permission里有通过用户名密码登录: `login_userpass`
    * match `userName` `password`; 否则返回`401 Unauthorized`
    * 返回JWT token (expire默认1小时);
  * 客户端在token过期之前, 在每个request里设置HEADER: `Authorization: Bearer [token]`, `X-WXXIE-AUTHTYPE: JWT`
  * API从JWT token中解析用户信息, 判断是否该用户可以用JWT token做authentication: `auth_jwt`, 如果有则继续; 如果无权限返回`401 Unauthorized`

* TODO: 手机+验证码 login session/token?

### list GET API支持的query

* filtering: 
  * 只支持等于的查找现在: `?<字段名>=<字段值>`
  * regmatch?
  * range?
* sorting: `?sort_by=<字段名>[:order]`, order可以是desc/asc
* pagination: `?offset=30&limit=15` 代表从第30个item开始. 每个list API的默认limit和max limit不同.

用在filtering/sorting query parameter里的字段, 只会解析标记为queryable的.

### API resource expansion
`?expand=shoe_model_id,user_id` 只解析标记为expandable的


服务端架构
============

```
+-------------|    o--------|    +--------------|    o--------|    +------|
|API(Node.js) | => |RabbitMQ| => |Runner(Python)| => |RabbitMQ| => |Pusher|
|-------------|    |---------    |---------------    |---------    |------|
```

数据库
============
MySQL

**还未完全确定**: schema设计见[`src/data/schema.js`](src/data/schema.js)

