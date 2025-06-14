import mongoose from "mongoose";

export class Db {
  constructor(protected dbLink: string) {
    this.dbLink = dbLink;
    this.initializeConnections();
  }

  protected async initializeConnections(): Promise<void> {
    try {
      if (this.dbLink) {
        await mongoose.connect(this.dbLink);
        `Database connected `;
      } else {
        throw new Error("You have to specifie db link");
      }
    } catch (error) {
      console.error(error);
    }
  }
}
