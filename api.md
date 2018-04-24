需求分析
============
### 用户操作流程

#### 用户登录
用户登录 -> 用户主页(任务列表)

#### 新建任务

**NOTE**: 有没有可能不同球鞋型号也会决定不同的模板...如果是这样的话...是不是要先任务类型和球鞋型号

任务列表 -> 新建任务 -> [optional: 需要选择任务的meta_tag] -> (选择球鞋型号, 拍照, 填写备注) -> 发布任务

#### 查看任务结果

任务列表(可下拉刷新)   -+
                        |\
                        ------> 查看任务
                        |/
消息推送(新的检测结果) -+

#### 修改未完成任务

任务列表 -> 选择任务 -> (选择球鞋型号, 拍照, 填写备注) -> 发布任务

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


============

可能有两种做法:
* 一种是分多个步骤, 先创建一个task, 把元信息传上去; 然后开始传multiple image(可用wx.uploadFile接口); 然后再post到一个接口让这个resource开始检测. task state: incompelete, waiting, finished
* 诶等一下...不用先创建task啊... 直接upload image之后. 每个image返回一个image的id值  (image的hash需要跟用户做relation). 然后post task接口创建一个task...并开始检测. 每个task需要记录一个json作为这个task的元数据把...因为不同版本的task元数据会不太一样... 这样的话有个问题就是如果没有或者没有成功新建task但是传了图片的怎么办? 比如有人攻击api一直上传垃圾图片又不创建task...很难管理...

* 另一种是一个包全部传上去... image可能需要压缩...这个要看看看一个包需要多大(打印看一下, 评估一下用哪个...)确定了这个才能确定task state有哪些: task state: waiting, finished. 这个就是状态可能比较好管理..只有两个状态.. 没有中间的没有成功传文件task这种可能. 好像用起来应该用这种可能好点... 但是不一定好做的是, 上传的进度条可不可以实现....而且这个方法还有个好处是可以用图像压缩算法或者base64的压缩算法..

* 还有一种方法, 必须新建一个task, 然后开始管理这个task. 反正每个人都有task上线. 如果一个task incomplete不会run. 如果一旦按了开始检测(注明之后无法更改) 就是waiting和finished. 上传图片的时候都是传到这个task...我觉得这个可以诶...


怎么保证检测系统可升级, 能兼容之前的任务, 针对不同的检测? 元信息里面最好也要传这是 v几 的检测输入给一个tag. 前端根据不同version的task应该都做自己的task template...