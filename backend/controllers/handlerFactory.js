import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
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

export const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};

    if (req.user.role === "product-manager") {
      filter = { createdBy: req.user.id };
    }

    if (req.user.role === "user") {
      filter = { assignedTo: req.user.id };
    }
    const docs = await Model.find(filter);

    res.status(200).json({
      status: "success",
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
