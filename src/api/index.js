var express = require("express");
var errors = require("../errors");
var permit = require("../middlewares/permission");
var setPageLimit = require("../middlewares/setPageLimit");
// api methods
var users = require("./users");
var tasks = require("./tasks");
var permissions = require("./permissions");
var brands = require("./brands");
var shoe_models = require("./shoe_models");

// config
var apiCfg = require("../config/api");

var apiRouter = express.Router();

function catchError(apiFunc) {
  return function(req, res, next) {
    try {
      return apiFunc(req, res, next)
        .catch(function(err) {
          next(err);
        });
    } catch ( err ) {
      next(new errors.InternalServerError({
        stack: err
      }));
    }
  };
}

// Endpoints under /users
apiRouter.get("/users/me", catchError(users.infoMe));

apiRouter.get("/users/:userId", permit(["me"], ["user"]), catchError(users.infoUser));

apiRouter.get("/users", permit(["user"]), setPageLimit(...(apiCfg.pagination.users||[])), catchError(users.listUsers));

apiRouter.post("/users", permit(["user"]), catchError(users.addUser));

apiRouter.put("/users/:userId", permit(["user"]),catchError(users.updateUser));

apiRouter.get("/users/:userId/tasks", permit(["me"], ["user", "task"]), setPageLimit(...(apiCfg.pagination.users_tasks||[])), catchError(users.listTasks));

apiRouter.get("/users/:userId/tasks/:taskId", permit(["me"], ["user", "task"]), catchError(users.getTask));

apiRouter.post("/users/:userId/tasks", permit(["me"]), catchError(tasks.addTask));

apiRouter.put("/users/:userId/tasks/:taskId", permit(["me"]), catchError(tasks.updateTask));

apiRouter.put("/users/:userId/tasks/:taskId/admin", permit(["me"], ["user", "task"]), catchError(tasks.updateTaskAdmin));

apiRouter.put("/users/:userId/tasks/:taskId/run", permit(["me"]), catchError(tasks.runTask));

apiRouter.delete("/users/:userId/tasks/:taskId", permit(["user", "task"]), catchError(tasks.deleteTask));

apiRouter.post("/users/:userId/tasks/:taskId/files", permit(["me"]), catchError(tasks.uploadTaskFile));

apiRouter.get("/users/:userId/tasks/:taskId/files/:fileType", permit(["me"]), catchError(tasks.downloadTaskFile));

// Endpoints under /permissions
apiRouter.get(    "/permissions", permit(["permission"]), catchError(permissions.listPermissions));
apiRouter.get(    "/permissions/:permissionName/users", permit(["permission"]), setPageLimit(...(apiCfg.pagination.permissions_users||[])), catchError(permissions.listPermissionUsers));
apiRouter.post(   "/permissions/:permissionName/users", permit(["permission"]), catchError(permissions.addPermissionUser));
apiRouter.delete( "/permissions/:permissionName/users/:userId", permit(["permission"]), catchError(permissions.deletePermissionUser));

// Endpoints under /brands
apiRouter.get(   "/brands", permit(["brand"]), setPageLimit(...(apiCfg.pagination.brands||[])), catchError(brands.listBrands));
apiRouter.post(  "/brands", permit(["brand"]), catchError(brands.addBrand));
apiRouter.get(   "/brands/:brandId", permit(["brand"]), catchError(brands.getBrand));
apiRouter.put(   "/brands/:brandId", permit(["brand"]), catchError(brands.updateBrand));
apiRouter.delete("/brands/:brandId", permit(["brand"]), catchError(brands.deleteBrand));

apiRouter.get(   "/brands/:brandId/shoe_models", permit(["brand"]), setPageLimit(...(apiCfg.pagination.brands_shoe_models||[])), catchError(shoe_models.listShoeModels));
apiRouter.post(  "/brands/:brandId/shoe_models", permit(["brand"]), catchError(shoe_models.addShoeModel));
apiRouter.get(   "/brands/:brandId/shoe_models/:shoemodelId", permit(["brand"]), catchError(shoe_models.getShoeModel));
apiRouter.put(   "/brands/:brandId/shoe_models/:shoemodelId", permit(["brand"]), catchError(shoe_models.updateShoeModel));
apiRouter.delete("/brands/:brandId/shoe_models/:shoemodelId", permit(["brand"]), catchError(shoe_models.deleteShoeModel));

// Endpoints under /tasks
apiRouter.get("/tasks", permit(["task"]), setPageLimit(...(apiCfg.pagination.tasks||[])), catchError(tasks.listAllTasks));

module.exports = apiRouter;
