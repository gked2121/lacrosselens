import {
  users,
  teams,
  videos,
  analyses,
  players,
  type User,
  type UpsertUser,
  type Team,
  type InsertTeam,
  type Video,
  type InsertVideo,
  type Analysis,
  type InsertAnalysis,
  type Player,
  type InsertPlayer,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser & { id: string }): Promise<User>;
  
  // Team operations
  createTeam(team: InsertTeam): Promise<Team>;
  getUserTeams(userId: string): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  
  // Video operations
  createVideo(video: InsertVideo): Promise<Video>;
  getUserVideos(userId: string): Promise<Video[]>;
  getVideo(id: number): Promise<Video | undefined>;
  updateVideoStatus(id: number, status: string): Promise<Video>;
  
  // Analysis operations
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getVideoAnalyses(videoId: number): Promise<Analysis[]>;
  getAnalysis(id: number): Promise<Analysis | undefined>;
  
  // Player operations
  createPlayer(player: InsertPlayer): Promise<Player>;
  getTeamPlayers(teamId: number): Promise<Player[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser & { id: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Team operations
  async createTeam(teamData: InsertTeam): Promise<Team> {
    const [team] = await db.insert(teams).values(teamData).returning();
    return team;
  }

  async getUserTeams(userId: string): Promise<Team[]> {
    return await db.select().from(teams).where(eq(teams.userId, userId)).orderBy(desc(teams.createdAt));
  }

  async getTeam(id: number): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  // Video operations
  async createVideo(videoData: InsertVideo): Promise<Video> {
    const [video] = await db.insert(videos).values(videoData).returning();
    return video;
  }

  async getUserVideos(userId: string): Promise<Video[]> {
    return await db.select().from(videos).where(eq(videos.userId, userId)).orderBy(desc(videos.createdAt));
  }

  async getVideo(id: number): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async updateVideoStatus(id: number, status: string): Promise<Video> {
    const [video] = await db
      .update(videos)
      .set({ status, updatedAt: new Date() })
      .where(eq(videos.id, id))
      .returning();
    return video;
  }

  // Analysis operations
  async createAnalysis(analysisData: InsertAnalysis): Promise<Analysis> {
    const [analysis] = await db.insert(analyses).values(analysisData).returning();
    return analysis;
  }

  async getVideoAnalyses(videoId: number): Promise<Analysis[]> {
    return await db
      .select()
      .from(analyses)
      .where(eq(analyses.videoId, videoId))
      .orderBy(analyses.timestamp);
  }

  async getAnalysis(id: number): Promise<Analysis | undefined> {
    const [analysis] = await db.select().from(analyses).where(eq(analyses.id, id));
    return analysis;
  }

  // Player operations
  async createPlayer(playerData: InsertPlayer): Promise<Player> {
    const [player] = await db.insert(players).values(playerData).returning();
    return player;
  }

  async getTeamPlayers(teamId: number): Promise<Player[]> {
    return await db.select().from(players).where(eq(players.teamId, teamId));
  }
}

export const storage = new DatabaseStorage();
