module.exports = {
  tableNames: ["permissions", "users", "tasks", "permissions_users"],

  users: {
    id: {
      type: "increments",
      nullable: false,
      primary: true
    },
    openId: {
      type: "string",
      nullable: false,
      unique: true
    },
    nickName: {
      type: "string",
      maxlength: 36,
      nullable: false
    },
    gender: {
      type: "integer",
      nullable: false
    },
    city: {
      type: "string",
      nullable: true
    },
    province: {
      type: "string",
      nullable: true
    },
    country: {
      type: "string",
      nullable: true
    },
    email: {
      type: "string",
      maxlength: 191,
      nullable: true,
      unique: true,
      validations: {
        isEmail: true
      }
    },
    phone: {
      type: "string",
      maxlength: 20,
      nullable: true,
      unique: true,
      validations: {
        isPhone: true
      }
    },
    quota: {
      type: "integer",
      nullable: false,
      validations: {
        isMinimum: 0
      }
    },

    created_at: {
      type: "dateTime",
      nullable: false
    },
    updated_at: {
      type: "dateTime",
      nullable: true
    }
  },

  tasks: {
    id: {
      type: "increments",
      nullable: false,
      primary: true
    },
    user_id: {
      type: "integer",
      nullable: false,
      unsigned: true,
      references: "users.id",
      onDelete: "CASCADE"
    },
    meta_tag: {
      type: "string",
      nullable: false,
      defaultTo: "v0.1"
    },
    shoe_model: {
      type: "string",
      nullable: true
    },
    comment: {
      type: "text",
      nullable: true
    },

    state: {
      type: "string",
      nullable: false,
      defaultTo: "incomplete",
      validations: {
        isIn: [["incomplete", "waiting", "finished", "failed"]]
      }
    },
    log: {
      type: "text",
      nullable: true
    },
    answer: {
      type: "string",
      nullable: true,
      validations: {
        isIn: [["fake", "not_sure", "true"]]
      }
    },

    run_time: {
      type: "datetime",
      nullable: true,
    },
    start_time: {
      type: "datetime",
      nullable: true,
    },
    finish_time: {
      type: "datetime",
      nullable: true,
    },

    created_at: {
      type: "dateTime",
      nullable: false
    },
    updated_at: {
      type: "dateTime",
      nullable: true
    }
  },

  permissions: {
    id: {
      type: "increments",
      nullable: false,
      primary: true
    },
    name: {
      type: "string",
      maxlength: 36,
      nullable: false,
      unique: true
    },
    description: {
      type: "string",
      maxlength: 150,
      nullable: false
    },

    created_at: {
      type: "dateTime",
      nullable: false
    },
    updated_at: {
      type: "dateTime",
      nullable: true
    }
  },

  permissions_users: {
    id: {
      type: "increments",
      nullable: false,
      primary: true
    },
    user_id: {
      type: "integer",
      nullable: false
    },
    permission_id: {
      type: "integer",
      nullable: false
    }
  }
};
