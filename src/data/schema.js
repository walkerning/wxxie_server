module.exports = {
  tableNames: ["permissions", "users", "brands", "shoe_models", "positions", "tasks", "permissions_users", "positions_shoe_models"],

  users: {
    id: {
      type: "increments",
      nullable: false,
      primary: true
    },
    // userName/password for dev/test login only // **TODO**: do not return. hash on save. password check func. password checker login middleware.
    // for wechat user, default to openId
    userName: {
      type: "string",
      nullable: false,
      unique: true
    },
    password: {
      type: "string",
      maxlength: 191,
      nullable: true
    },

    openId: {
      type: "string",
      nullable: true,
      unique: true
    },
    nickName: {
      type: "string",
      maxlength: 36,
      nullable: false
    },
    gender: {
      type: "integer",
      nullable: false,
      validations: {
        isIn: [[0,1,2,3]]
      }
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

  brands: {
    id: {
      type: "increments",
      nullable: false,
      primary: true
    },
    image: {
      type: "string",
      nullable: false
    },
    name: {
      type: "string",
      nullable: false
    },
    show_name: {
      type: "string",
      nullable: false
    },
    description: {
      type: "text",
      nullable: false
    },
    state: {
      type: "string",
      nullable: false,
      defaultTo: "no",
      validations: {
        isIn: [["no", "testing", "supported"]]
      }
    },

    supported_at: {
      type: "dateTime",
      nullable: true
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

  shoe_models: {
    id: {
      type: "increments",
      nullable: false,
      primary: true
    },

    image: {
      type: "string",
      nullable: false
    },
    name: {
      type: "string",
      nullable: false
    },
    show_name: {
      type: "string",
      nullable: false
    },
    description: {
      type: "text",
      nullable: false
    },
    state: {
      type: "string",
      nullable: false,
      defaultTo: "no",
      validations: {
        isIn: [["no", "testing", "supported"]]
      }
    },
    // positions: {
    //   type: "text",
    //   nullable: false,
    //   validations: {
    //     isJSON: true
    //   }
    // },
    brand_id: {
      type: "integer",
      nullable: false,
      unsigned: true,
      index: true,
      references: "brands.id",
      onDelete: "CASCADE"
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

  positions: {
    id: {
      type: "increments",
      nullable: false,
      primary: true
    },
    name: {
      type: "string",
      nullable: false
    },
    show_name: {
      type: "string",
      nullable: false
    },
    image: {
      type: "string",
      nullable: false
    },
    example_image: {
      type: "string",
      nullable: true
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
      composite_index: {
        name: 0,
        order: 0
      },
      references: "users.id",
      onDelete: "CASCADE"
    },
    shoe_model_id: {
      type: "integer",
      nullable: false,
      unsigned: true,
      index: true,
      composite_index: {
        name: 0,
        order: 1
      },
      references: "shoe_models.id",
      onDelete: "CASCADE"
    },

    meta_tag: {
      type: "string",
      nullable: false,
      maxlength: 20,
      defaultTo: "v0.1"
    },
    task_name: {
      type: "string",
      maxlength: 40,
      nullable: false
    },
    type: {
      type: "string",
      nullable: false,
      validations: {
        isIn: [["new", "old"]]
      }
    },
    buy_type: {
      type: "string",
      nullable: false,
      validations: {
        isIn: [["Physical", "Tmall", "JD", "Taobao", "Other"]]
      }
    },
    buy_other_type: {
      type: "string",
      maxlength: 20,
      nullable: true
    },
    buy_name: {
      type: "text",
      maxlength: 36,
      nullable: true
    },
    comment: {
      type: "text",
      nullable: true,
      maxlength: 100
    },
    form_id: {
      type: "string",
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
      nullable: true,
      maxlength: 600
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
      nullable: false,
      unsigned: true,
      index: true,
      references: "users.id",
      onDelete: "CASCADE"
    },
    permission_id: {
      type: "integer",
      nullable: false,
      unsigned: true,
      references: "permissions.id",
      onDelete: "CASCADE"
    }
  },

  positions_shoe_models: {
    id: {
      type: "increments",
      nullable: false,
      primary: true
    },
    position_id: {
      type: "integer",
      nullable: false,
      unsigned: true,
      references: "positions.id",
      onDelete: "CASCADE"
    },
    shoe_model_id: {
      type: "integer",
      nullable: false,
      unsigned: true,
      index: true,
      references: "shoe_models.id",
      onDelete: "CASCADE"
    }
  }
};
