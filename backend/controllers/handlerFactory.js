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

  if (user.role === "admin") {
    return filter;
  }

  if (Model.modelName === "Task") {
    if (user.role === "department-manager") {
      filter = { createdBy: user.id };
    } else if (user.role === "user" || user.role === "employee") {
      filter = { assignedTo: user.id };
    }
  } else if (Model.modelName === "User") {
    if (user.role === "department-manager") {
      filter = { department: user.department };
    } else {
      filter = { _id: user.id };
    }
  }
  // console.log("Computed filter for getAll:", filter);
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
