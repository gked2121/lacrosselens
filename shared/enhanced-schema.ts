// Enhanced schema for detailed lacrosse analytics
// This file contains new tables to capture comprehensive data from Gemini analysis

import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
  decimal,
  uuid,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { videos, analyses } from "./schema";

// Enhanced Player Profiles - Much more detailed player tracking
export const playerProfiles = pgTable("player_profiles", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull().references(() => videos.id),
  playerIdentifier: varchar("player_identifier", { length: 100 }).notNull(), // "#23 White" or "Attackman Blue #7"
  jerseyNumber: varchar("jersey_number", { length: 10}),
  teamColor: varchar("team_color", { length: 50}), // white, dark, blue, red, etc.
  position: varchar("position", { length: 50}), // attack, midfield, defense, goalie, fogo
  
  // Physical attributes detected
  handedness: varchar("handedness", { length: 20}), // right, left, ambidextrous
  estimatedHeight: varchar("estimated_height", { length: 20}), // tall, average, short
  athleticism: integer("athleticism_score"), // 1-100
  
  // Performance metrics
  overallRating: decimal("overall_rating", { precision: 3, scale: 1 }), // 1.0-5.0
  potentialRating: decimal("potential_rating", { precision: 3, scale: 1 }), // 1.0-5.0
  coachabilityScore: integer("coachability_score"), // 1-100
  
  // Skill ratings (1-100)
  dodgingSkill: integer("dodging_skill"),
  shootingSkill: integer("shooting_skill"),
  passingSkill: integer("passing_skill"),
  groundBallSkill: integer("ground_ball_skill"),
  defenseSkill: integer("defense_skill"),
  offBallMovement: integer("off_ball_movement"),
  lacrosseIQ: integer("lacrosse_iq"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_player_profiles_video").on(table.videoId),
  uniqueIndex("idx_player_profiles_unique").on(table.videoId, table.playerIdentifier),
]);

// Detailed Play-by-Play Events
export const playEvents = pgTable("play_events", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull().references(() => videos.id),
  analysisId: integer("analysis_id").references(() => analyses.id),
  
  // Event timing
  startTimestamp: decimal("start_timestamp", { precision: 10, scale: 2 }).notNull(), // seconds with decimals
  endTimestamp: decimal("end_timestamp", { precision: 10, scale: 2 }),
  quarter: integer("quarter"), // 1-4 or OT
  
  // Event categorization
  eventType: varchar("event_type", { length: 50 }).notNull(), // goal, assist, save, turnover, penalty, faceoff, etc.
  eventSubtype: varchar("event_subtype", { length: 100 }), // dodge_goal, time_and_room, man_up, etc.
  
  // Players involved
  primaryPlayerId: integer("primary_player_id").references(() => playerProfiles.id),
  secondaryPlayerId: integer("secondary_player_id").references(() => playerProfiles.id), // for assists, caused turnovers
  
  // Location on field
  fieldZone: varchar("field_zone", { length: 50 }), // attack_box, midfield, defensive_zone, crease, x_area
  fieldSide: varchar("field_side", { length: 20 }), // left, right, center
  
  // Event details
  success: boolean("success").default(true),
  confidence: integer("confidence"), // 0-100
  description: text("description"),
  
  // Additional context
  gameContext: varchar("game_context", { length: 50 }), // even_strength, man_up, man_down, transition
  momentum: varchar("momentum", { length: 20 }), // positive, negative, neutral
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_play_events_video").on(table.videoId),
  index("idx_play_events_timestamp").on(table.startTimestamp),
  index("idx_play_events_type").on(table.eventType),
]);

// Face-off Specific Details
export const faceoffDetails = pgTable("faceoff_details", {
  id: serial("id").primaryKey(),
  playEventId: integer("play_event_id").notNull().references(() => playEvents.id),
  
  // FOGO players
  team1FogoId: integer("team1_fogo_id").references(() => playerProfiles.id),
  team2FogoId: integer("team2_fogo_id").references(() => playerProfiles.id),
  
  // Technique analysis
  team1Technique: varchar("team1_technique", { length: 100 }), // clamp, rake, jump, plunger
  team2Technique: varchar("team2_technique", { length: 100 }),
  
  // Clamp details
  clampSpeed: varchar("clamp_speed", { length: 20 }), // fast, medium, slow
  clampAngle: varchar("clamp_angle", { length: 50 }), // forward, neutral, reverse
  
  // Counter moves
  counterMove: varchar("counter_move", { length: 100 }),
  counterTiming: varchar("counter_timing", { length: 50 }), // early, on-time, late
  
  // Exit strategy
  exitDirection: varchar("exit_direction", { length: 50 }), // forward, back, left, right
  exitSpeed: varchar("exit_speed", { length: 20 }), // explosive, controlled, slow
  
  // Wing play
  wingSupport: boolean("wing_support"),
  wingPlayDescription: text("wing_play_description"),
  
  // Outcome
  winner: varchar("winner", { length: 20 }), // team1, team2, violation
  possessionTeam: varchar("possession_team", { length: 20 }),
  fastBreakOpportunity: boolean("fast_break_opportunity"),
  
  // Advanced metrics
  winProbabilityChange: decimal("win_probability_change", { precision: 5, scale: 2 }),
  technicalScore: integer("technical_score"), // 1-100
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Transition Play Details
export const transitionDetails = pgTable("transition_details", {
  id: serial("id").primaryKey(),
  playEventId: integer("play_event_id").notNull().references(() => playEvents.id),
  
  // Transition type
  transitionType: varchar("transition_type", { length: 50 }).notNull(), // clear, ride, unsettled
  originatingEvent: varchar("originating_event", { length: 100 }), // save, turnover, faceoff_win
  
  // Clear/Ride specifics
  clearingTeam: varchar("clearing_team", { length: 20 }),
  ridingTeam: varchar("riding_team", { length: 20 }),
  
  // Formation and strategy
  clearFormation: varchar("clear_formation", { length: 100 }), // banana, wide, traditional
  rideFormation: varchar("ride_formation", { length: 100 }), // 10-man, zone, adjacent
  
  // Key players
  primaryClearerId: integer("primary_clearer_id").references(() => playerProfiles.id),
  primaryRiderId: integer("primary_rider_id").references(() => playerProfiles.id),
  
  // Execution details
  passCount: integer("pass_count"),
  groundBallsInTransition: integer("ground_balls"),
  substitutionPattern: varchar("substitution_pattern", { length: 100 }),
  
  // Pressure and spacing
  pressureLevel: varchar("pressure_level", { length: 20 }), // high, medium, low
  fieldSpacing: varchar("field_spacing", { length: 50 }), // compressed, balanced, stretched
  
  // Outcome
  successful: boolean("successful"),
  resultingOpportunity: varchar("resulting_opportunity", { length: 100 }), // fast_break, slow_break, settled
  timeToComplete: decimal("time_to_complete", { precision: 5, scale: 2 }), // seconds
  
  // Advanced metrics
  expectedSuccessRate: decimal("expected_success_rate", { precision: 5, scale: 2 }),
  executionQuality: integer("execution_quality"), // 1-100
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Shot Details - Comprehensive shooting data
export const shotDetails = pgTable("shot_details", {
  id: serial("id").primaryKey(),
  playEventId: integer("play_event_id").notNull().references(() => playEvents.id),
  shooterId: integer("shooter_id").notNull().references(() => playerProfiles.id),
  
  // Shot characteristics
  shotType: varchar("shot_type", { length: 50 }).notNull(), // overhand, sidearm, underhand, behind_the_back
  shotLocation: varchar("shot_location", { length: 50 }), // top_shelf, low_corner, five_hole, etc.
  shotDistance: varchar("shot_distance", { length: 20 }), // close, medium, long
  shotAngle: varchar("shot_angle", { length: 20 }), // straight, left, right, behind_cage
  
  // Shot context
  assistedBy: integer("assisted_by").references(() => playerProfiles.id),
  dodgeType: varchar("dodge_type", { length: 50 }), // roll, split, face, bull
  timeAndRoom: boolean("time_and_room"),
  onTheRun: boolean("on_the_run"),
  
  // Defense pressure
  defenderProximity: varchar("defender_proximity", { length: 20 }), // tight, moderate, open
  slidePackage: varchar("slide_package", { length: 50 }), // adjacent, crease, none
  
  // Shot quality
  shotVelocity: varchar("shot_velocity", { length: 20 }), // hard, medium, soft
  shotPlacement: varchar("shot_placement", { length: 20 }), // perfect, good, poor
  deception: boolean("deception"),
  
  // Goalie interaction
  goalieId: integer("goalie_id").references(() => playerProfiles.id),
  goaliePosition: varchar("goalie_position", { length: 50 }), // centered, cheating_left, etc.
  saveType: varchar("save_type", { length: 50 }), // stick_save, body_save, missed
  
  // Result
  result: varchar("result", { length: 20 }).notNull(), // goal, save, miss, post, blocked
  reboundControlled: boolean("rebound_controlled"),
  
  // Advanced metrics
  expectedGoalProbability: decimal("expected_goal_probability", { precision: 5, scale: 2 }),
  shotQualityScore: integer("shot_quality_score"), // 1-100
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Defensive Play Details
export const defensiveDetails = pgTable("defensive_details", {
  id: serial("id").primaryKey(),
  playEventId: integer("play_event_id").notNull().references(() => playEvents.id),
  defenderId: integer("defender_id").notNull().references(() => playerProfiles.id),
  
  // Defensive action type
  actionType: varchar("action_type", { length: 50 }).notNull(), // check, slide, recover, double
  technique: varchar("technique", { length: 100 }), // poke, slap, wrap, body
  
  // Positioning
  positioning: varchar("positioning", { length: 50 }), // topside, even, trailing
  footwork: varchar("footwork", { length: 50 }), // balanced, reaching, recovering
  
  // Communication
  communicationLevel: varchar("communication_level", { length: 20 }), // high, medium, low
  slideRecognition: boolean("slide_recognition"),
  
  // Outcome
  successful: boolean("successful"),
  causedTurnover: boolean("caused_turnover"),
  drewPenalty: boolean("drew_penalty"),
  
  // Quality metrics
  techniqueScore: integer("technique_score"), // 1-100
  timingScore: integer("timing_score"), // 1-100
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Team Formations and Tactics
export const teamFormations = pgTable("team_formations", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull().references(() => videos.id),
  timestamp: decimal("timestamp", { precision: 10, scale: 2 }).notNull(),
  
  // Team identification
  teamColor: varchar("team_color", { length: 50 }).notNull(),
  
  // Formation type
  offensiveFormation: varchar("offensive_formation", { length: 100 }), // 2-2-2, 3-3, 1-4-1
  defensiveFormation: varchar("defensive_formation", { length: 100 }), // man, zone, hybrid
  
  // Personnel
  personnelPackage: varchar("personnel_package", { length: 100 }), // standard, heavy_middies, invert
  
  // Tactical details
  ballMovement: varchar("ball_movement", { length: 50 }), // quick, patient, stagnant
  offBallMovement: varchar("off_ball_movement", { length: 50 }), // active, moderate, static
  spacing: varchar("spacing", { length: 50 }), // good, compressed, over_extended
  
  // Execution quality
  executionScore: integer("execution_score"), // 1-100
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_team_formations_video").on(table.videoId),
  index("idx_team_formations_timestamp").on(table.timestamp),
]);

// Game Flow and Momentum
export const gameFlow = pgTable("game_flow", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull().references(() => videos.id),
  
  // Time period
  startTimestamp: decimal("start_timestamp", { precision: 10, scale: 2 }).notNull(),
  endTimestamp: decimal("end_timestamp", { precision: 10, scale: 2 }).notNull(),
  
  // Momentum metrics
  possessionTeam: varchar("possession_team", { length: 50 }),
  possessionQuality: varchar("possession_quality", { length: 20 }), // high, medium, low
  pressureLevel: varchar("pressure_level", { length: 20 }), // intense, moderate, relaxed
  
  // Game state
  scoreDifferential: integer("score_differential"),
  gameContext: varchar("game_context", { length: 50 }), // close_game, blowout, comeback
  
  // Pace and style
  pace: varchar("pace", { length: 20 }), // fast, medium, slow
  style: varchar("style", { length: 50 }), // run_and_gun, possession, physical
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_game_flow_video").on(table.videoId),
  index("idx_game_flow_timestamp").on(table.startTimestamp),
]);

// Coaching Points and Recommendations
export const coachingPoints = pgTable("coaching_points", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull().references(() => videos.id),
  playerId: integer("player_id").references(() => playerProfiles.id),
  
  // Point categorization
  category: varchar("category", { length: 50 }).notNull(), // technique, tactics, conditioning, mental
  subcategory: varchar("subcategory", { length: 100 }),
  
  // Priority and timing
  priority: varchar("priority", { length: 20 }).notNull(), // high, medium, low
  timeframe: varchar("timeframe", { length: 50 }), // immediate, short_term, long_term
  
  // Coaching content
  observation: text("observation").notNull(),
  recommendation: text("recommendation").notNull(),
  drillSuggestion: text("drill_suggestion"),
  
  // Related moments
  relatedTimestamps: text("related_timestamps").array(), // array of timestamp strings
  
  // Implementation difficulty
  difficulty: varchar("difficulty", { length: 20 }), // easy, moderate, challenging
  estimatedImprovementTime: varchar("estimated_improvement_time", { length: 50 }), // days, weeks, months
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_coaching_points_video").on(table.videoId),
  index("idx_coaching_points_player").on(table.playerId),
  index("idx_coaching_points_priority").on(table.priority),
]);

// Export all tables for relations
export * from "./schema"; // Re-export existing tables