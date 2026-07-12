import { TripStatus } from "@prisma/client";
import { asyncHandler } from "../utils/async-handler";
import { sendSuccess } from "../utils/api-response";
import * as tripService from "../services/trip.service";

function getParamId(value: unknown) {
  return String(value);
}

export const listTrips = asyncHandler(async (req, res) => {
  const filters: tripService.TripListFilters = {};

  if (typeof req.query.status === "string") {
    filters.status = req.query.status as TripStatus;
  }

  if (typeof req.query.vehicleId === "string") {
    filters.vehicleId = req.query.vehicleId;
  }

  if (typeof req.query.driverId === "string") {
    filters.driverId = req.query.driverId;
  }

  const trips = await tripService.listTrips(filters);

  return sendSuccess(res, "Trips retrieved", trips);
});

export const getTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.getTripById(getParamId(req.params.id));

  return sendSuccess(res, "Trip retrieved", trip);
});

export const createTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.createTrip(req.body);

  return sendSuccess(res, "Trip created", trip, 201);
});

export const updateTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.updateTrip(getParamId(req.params.id), req.body);

  return sendSuccess(res, "Trip updated", trip);
});

export const dispatchTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.dispatchTrip(getParamId(req.params.id));

  return sendSuccess(res, "Trip dispatched", trip);
});

export const completeTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.completeTrip(getParamId(req.params.id), req.body);

  return sendSuccess(res, "Trip completed", trip);
});

export const cancelTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.cancelTrip(getParamId(req.params.id));

  return sendSuccess(res, "Trip cancelled", trip);
});

export const deleteTrip = asyncHandler(async (req, res) => {
  await tripService.deleteTrip(getParamId(req.params.id));

  return sendSuccess(res, "Trip deleted", null);
});
