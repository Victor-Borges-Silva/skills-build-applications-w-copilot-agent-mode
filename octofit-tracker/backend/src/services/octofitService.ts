import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

function normalizeRequiredString(value: unknown, field: string) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) {
    throw httpError(400, `${field} is required`);
  }
  return text;
}

function parseObjectId(value: unknown, field: string) {
  if (typeof value !== 'string' || !mongoose.isValidObjectId(value)) {
    throw httpError(400, `Invalid ${field} id`);
  }
  return new mongoose.Types.ObjectId(value);
}

export async function listActivities() {
  return Activity.find().sort({ occurredAt: -1 }).lean();
}

export async function createActivity(input: unknown) {
  const payload = (input ?? {}) as Record<string, unknown>;
  const userId = parseObjectId(payload.userId, 'user');
  const teamId = parseObjectId(payload.teamId, 'team');
  const type = normalizeRequiredString(payload.type, 'type');
  const minutes = Number(payload.minutes);

  if (!Number.isFinite(minutes) || minutes <= 0) {
    throw httpError(400, 'minutes must be a positive number');
  }

  const user = await User.findById(userId);
  const team = await Team.findById(teamId);
  if (!user || !team) {
    throw httpError(404, 'User or team not found');
  }

  const activity = await Activity.create({
    user: userId,
    team: teamId,
    type,
    minutes,
    points: Math.max(1, Math.round(minutes)),
    occurredAt: new Date(),
  });

  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const payload = (input ?? {}) as Record<string, unknown>;
  const name = normalizeRequiredString(payload.name, 'name');
  const mascot = normalizeRequiredString(payload.mascot, 'mascot');
  const members = Array.isArray(payload.members) ? payload.members : [];

  const memberIds = members.map((member) => parseObjectId(member, 'member'));
  const team = await Team.create({ name, mascot, members: memberIds });
  return team.toObject();
}

export async function getLeaderboard() {
  const leaderboard = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $lookup: { from: 'teams', localField: '_id', foreignField: '_id', as: 'teamDetails' } },
    { $unwind: '$teamDetails' },
    { $project: { _id: 0, teamName: '$teamDetails.name', totalPoints: 1 } },
    { $sort: { totalPoints: -1, teamName: 1 } },
  ]);

  return leaderboard.map((entry, index) => ({
    teamName: entry.teamName,
    totalPoints: entry.totalPoints,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  const email = normalizeRequiredString(userEmail, 'email').toLowerCase();
  const user = await User.findOne({ email }).lean();

  if (!user) {
    throw httpError(404, 'User not found');
  }

  const recentActivities = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(5).lean();
  const recentType = recentActivities[0]?.type as string | undefined;
  const goal = typeof user.fitnessGoal === 'string' ? user.fitnessGoal.trim().toLowerCase() : '';
  const preferredFocus = goal || recentType || 'endurance';

  const workouts = await Workout.find({}).lean();
  const chosen = workouts.find((workout) => workout.focus?.toLowerCase() === preferredFocus)
    ?? workouts.find((workout) => workout.focus?.toLowerCase() === goal)
    ?? workouts.find((workout) => workout.focus?.toLowerCase() === recentType)
    ?? workouts[0];

  if (!chosen) {
    return [];
  }

  const reason = recentType
    ? `Your recent ${recentType} activity and goal focus on ${chosen.focus}.`
    : `Your goal focuses on ${chosen.focus}.`;

  return [{ ...chosen, reason }];
}

export { User };
