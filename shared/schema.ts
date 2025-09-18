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
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const VIDEO_STATUS = {
  UPLOADING: "uploading",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export const VIDEO_STATUS_VALUES = [
  VIDEO_STATUS.UPLOADING,
  VIDEO_STATUS.PROCESSING,
  VIDEO_STATUS.COMPLETED,
  VIDEO_STATUS.FAILED,
] as const;

export type VideoStatus = (typeof VIDEO_STATUS_VALUES)[number];

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Teams table
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Videos table
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  filePath: varchar("file_path"),
  youtubeUrl: varchar("youtube_url"),
  duration: integer("duration"), // in seconds
  thumbnailUrl: varchar("thumbnail_url"),
  userId: varchar("user_id").notNull().references(() => users.id),
  teamId: integer("team_id").references(() => teams.id),
  status: varchar("status", { length: 50 })
    .notNull()
    .default(VIDEO_STATUS.UPLOADING), // uploading, processing, completed, failed
  userPrompt: text("user_prompt"), // Custom analysis prompt
  playerNumber: varchar("player_number", { length: 10 }),
  teamName: varchar("team_name", { length: 100 }),
  position: varchar("position", { length: 50 }),
  level: varchar("level", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Analysis results table - Enhanced with more analysis types
export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull().references(() => videos.id),
  type: varchar("type", { length: 100 }).notNull(), // player_evaluation, face_off, transition, overall, tactical, key_moment, coaching_point
  subtype: varchar("subtype", { length: 100 }), // For more specific categorization
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  timestamp: integer("timestamp"), // timestamp in video (seconds)
  endTimestamp: integer("end_timestamp"), // for plays that span time
  confidence: integer("confidence"), // 0-100
  metadata: jsonb("metadata"), // additional structured data - now much more detailed
  playerIdentifiers: text("player_identifiers").array(), // array of player identifiers involved
  tags: text("tags").array(), // searchable tags
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_analyses_video").on(table.videoId),
  index("idx_analyses_type").on(table.type),
  index("idx_analyses_timestamp").on(table.timestamp),
]);

// Players table for team management
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  jerseyNumber: integer("jersey_number"),
  position: varchar("position", { length: 50}),
  teamId: integer("team_id").notNull().references(() => teams.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced Player Profiles - Detailed player tracking per video
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

// Schema validations
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnalysisSchema = createInsertSchema(analyses).omit({
  id: true,
  createdAt: true,
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analyses.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

// New enhanced types
export type PlayerProfile = typeof playerProfiles.$inferSelect;
export type PlayEvent = typeof playEvents.$inferSelect;
export type FaceoffDetail = typeof faceoffDetails.$inferSelect;
export type TransitionDetail = typeof transitionDetails.$inferSelect;
