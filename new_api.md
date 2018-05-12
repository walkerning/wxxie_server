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
  // String[required]: openID
  "openId": "...",
  // String[required]: 用户昵称
  "nickName": "球球君",
  // Integer[required]: 性别
  "gender": 2,
  // String[optional]: 城市
  "city": "",
  // String[optional]: 省份
  "province": "",
  // String[optional]: 国家
  "country": "",
  // String[optional]: 用户邮箱
  "email": "",
  // String[optional]: 用户手机
  "phone": "",
  // Integer[required]: 用户可拥有的task上限
  "quota": 10
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
  "description": "用户管理权限"
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
  // String[required]: 品牌状态: no/testing/supported表示 还未支持/内测/已经开放支持
  "state": "no"
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
  // String[required]: 位置模版图请求路径
  "image": "/static/pics/templates/4cd04e251a92f9919a8b6ed76a9a1664aede694e.png",
  // String[required]: 位置示例图请求路径
  "example_image": "/static/pics/templates/2e01d694966a1e5fbf111374e772ba0167b5f3e2.png"
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
  // Int[required,expandable]: 任务所属用户Id
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

  // String[required]: 当前用户对该荣誉的申请状况, incomplete/waiting/finished/failed 分别代表
  //                   未完全/等待中/已完成/任务失败
  "state": "incomplete",
  // String[optional]: 运行记录, 在debug/test模式部署的服务器才返回
  "log": "",
  // String[optional]: 鉴定结果, [null, undefined]/fake/not_sure/true
  "answer": null,

  // String[required]: 该任务创建的时间(ISO format)
  "create_time": "2017-09-01T10:54:24.738793",
  // String[optional]: 该任务开始等待的时间(ISO format)
  "start_time": "2017-09-01T10:54:24.738793",
  // String[optional]: 该任务完成的时间(ISO format)
  "finish_time": "2017-09-01T10:54:24.738793"
}
```

API
============

### 用户相关

* ``GET /api/v1/users/{user_id}``: 得到自己用户信息

* ``PUT /api/v1/users/{user_id}``: 修正自己的用户信息, NOTE: 现在不提供管理API. 要提供管理API的接口的话...再加入自己定义的permission, group之类的吧

### 任务相关

* ``GET /api/v1/users/{user_id}/tasks``: 得到某个`user_id`的用户的所有task的列表
  * **权限**: ``user_id == me``
  * **返回**: [Task]
* ``POST /api/v1/users/{user_id}/tasks``: 创建一个新task
  * **权限**: ``user_id == me``
  * **条件**: ``len(user.tasks) < user.quota``
  * **返回**: Task
* ``PUT /api/v1/users/{user_id}/tasks/{task_id}``: 修改任务信息, 不能改state
  * **权限**: ``user_id == me``
  * **条件**: ``task.state == "incompelete"``
  * **返回**: Task
* ``POST /api/v1/users/{user_id}/tasks/{task_id}/files``: 上传一个task的文件
  * **权限**: ``user_id == me``
  * **条件**: ``task.state == "incompelete"``
  * **返回**:
* ``PUT /api/v1/users/{user_id}/tasks/{task_id}/run``: 开始run一个task, 会检查是否这个任务, 需要满足的条件是否已经满足, 如果task已经在waiting/finished状态直接返回.
  * **权限**: ``user_id == me``
  * **返回**: Task

NOTE: 不提供删除API暂时...需要的话到时候再加

### 认证相关

服务器架构
============

```
+-------------|    o--------|    +--------------|    o--------|    +------|
|API(Node.js) | => |RabbitMQ| => |Runner(Python)| => |RabbitMQ| => |Pusher|
|-------------|    |---------    |---------------    |---------    |------|
```

数据库
============
mysql
