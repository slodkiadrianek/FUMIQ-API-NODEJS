import { RedisCacheService } from "../types/common.type.js";
import { Logger } from "../utils/logger.js";
import { Model, Types, UpdateQuery, DeleteResult } from "mongoose";
import { AppError } from "../models/error.model.js";
export class BaseService {
  constructor(public logger: Logger, public caching: RedisCacheService) {}

  insertToDatabaseAndCache = async <T>(
    type: string,
    data: Omit<T, "_id">,
    table: Model<T>
  ): Promise<T> => {
    const result: T = await table.create({
      ...data,
    });
    if (result instanceof Types.ObjectId) {
      await this.caching.set(
        `${type}-${result._id}`,
        JSON.stringify(result),
        300
      );
    }
    return result;
  };
  getAllItems = async <T>(
    type: string,
    userId: string,
    table: Model<T>
  ): Promise<T[]> => {
    if (await this.caching.exists(`${type}-${userId}`)) {
      const result: T[] | null = JSON.parse(
        (await this.caching.get(`${type}-${userId}`)) || ""
      );
      if (!result) {
        this.logger.error(
          `An error occurred while retrieving ${type} for ${userId} from the cache.`
        );
        throw new AppError(
          404,
          type,
          `An error occurred while retrieving ${type} for ${userId} from the cache.`
        );
      }
      return result;
    }
    const result: T[] = await table.find({
      userId: new Types.ObjectId(userId),
    });
    await this.caching.set(`${type}-${userId}`, JSON.stringify(result), 300);
    return result;
  };
  getItemById = async <T>(
    type: string,
    id: string,
    table: Model<T>
  ): Promise<T> => {
    if (await this.caching.exists(`${type}-${id}`)) {
      const result: T | null = JSON.parse(
        (await this.caching.get(`${type}-${id}`)) || ""
      );
      if (!result) {
        this.logger.error(
          `An error occurred while retrieving ${type} from the cache.`,
          { id }
        );
        throw new AppError(
          404,
          type,
          `An error occurred while retrieving ${type}  from the cache.`
        );
      }
      return result;
    }
    const result: T | null = await table.findOne({
      _id: id,
    });
    if (!result) {
      this.logger.error(`${type} with this ID does not exist"`, { id });
      throw new AppError(404, type, `${type} with this ID does not exist`);
    }
    await this.caching.set(`${type}-${id}`, JSON.stringify(result), 300);
    return result;
  };
  updateItem = async <T>(
    type: string,
    id: string,
    data: UpdateQuery<T>,
    table: Model<T>
  ): Promise<T> => {
    const result: T | null = await table.findOneAndUpdate(
      { _id: id },
      {
        ...data,
      },
      {
        new: true,
      }
    );
    if (!result) {
      this.logger.error("Warehouse with this ID does not exist", { id });
      throw new AppError(404, type, `${type} with this ID does not exist`);
    }
    await this.caching.set(`${type}-${id}`, JSON.stringify(result), 300);
    return result;
  };
  deleteItem = async <T>(
    type: string,
    id: string,
    table: Model<T>
  ): Promise<string> => {
    const result: DeleteResult | null = await table.deleteOne({ _id: id });
    if (!result) {
      this.logger.error(`${type} with this ID does not exist", { id }`);
      throw new AppError(404, type, `${type} with this ID does not exist`);
    }
    await this.caching.del(`${type}-${id}`);
    return `${type} deleted successfully`;
  };
}
