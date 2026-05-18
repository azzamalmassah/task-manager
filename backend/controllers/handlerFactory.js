import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { APIFeatures } from "../utils/apiFeatures.js";
export const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

export const getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new AppError("No item found with this ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

// Helper to compute role- and model-aware filters for `getAll`
export const GetAllFilter = (Model, user) => {
  let filter = {};

  if (!user) return filter;
  // to get tasks of a specific project or to get all tasks, if the user is admin or product manager,
  //  he can only see the tasks he created, if the user is employee, he can only see the tasks assigned to him
  if (Model.modelName === "Task") {
    if (user.role === "department-manager" || user.role === "admin") {
      filter = { createdBy: user.id };
    } else if (user.role === "user" || user.role === "employee") {
      filter = { assignedTo: user.id };
    }
    // to get all users, if the user is department manager, he can only see the users of his department,
    //  if the user is admin, he can see all users
  } else if (Model.modelName === "User") {
    if (user.role === "department-manager") {
      filter = { department: user.department };
    } else if (user.role === "admin") {
      filter = {};
    } else {
      filter = { _id: user.id };
    }
  } else {
    // for other models, if the user is admin or department manager,
    //  he can see all items, if the user is employee or user, he can only see the items created by him
    if (user.role === "product-manager" || user.role === "admin") {
      filter = { createdBy: user.id };
    } else if (user.role === "user") {
      filter = { assignedTo: user.id };
    }
  }

  return filter;
};

export const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // compute filter using helper
    let filter = GetAllFilter(Model, req.user);
    const defaults = res.locals.aliasQuery || {};
    const effectiveQuery = { ...defaults, ...(req.query || {}) };
    // EXECUTE QUERY (apply the computed filter to the base query)
    const features = new APIFeatures(Model.find(filter), effectiveQuery)
      .filter()
      .sorting()
      .limiting()
      .paginate();
    const docs = await features.query;

    res.status(200).json({
      status: "success",
      result: docs.length,
      data: {
        data: docs,
      },
    });
  });

export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) {
      return next(new AppError("No Document found with this ID", 404));
    }
    await Model.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: "success",
      data: null,
    });
  });

export const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError("No Document found with this ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });
