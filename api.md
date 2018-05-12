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

### 用户 User

```javascript
{
  // String[required]: 当前用户昵称
  "nick_name": "球球君",
  // String[optional]: 当前用户邮箱
  "email": "",
  // String[optional]: 当前用户手机
  "phone": "",
  // Integer[required]: 当前用户可拥有的task上限
  "quota": 10
}
```
### 任务 Task

```javascript
{
  // String[required]: 当前任务的类型, 会决定其前端渲染的模板, 和后端的task validator和runner的行为.
  "meta_tag": "v0.1",
  // String[required]: 球鞋型号
  "shoe_model": "adidas_superstar",
  // String[optional]: 备注
  "comment": "",

  // String[required]: 当前用户对该荣誉的申请状况, incomplete/waiting/finished 分别代表
  //                   未完全/等待中/已完成
  "state": "incomplete",
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
