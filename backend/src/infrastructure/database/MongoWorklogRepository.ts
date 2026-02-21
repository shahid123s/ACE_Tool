import { IWorklogRepository, WorklogFilters } from '../../domain/worklog/IWorklogRepository.js';
import { Worklog } from '../../domain/worklog/Worklog.js';
import { WorklogModel, WorklogDocument } from './schemas/WorklogSchema.js';

export class MongoWorklogRepository implements IWorklogRepository {

    async save(worklog: Worklog): Promise<Worklog> {
        const data = worklog.toPersistence();
        const { id, ...rest } = data;

        if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
            // Update existing
            const updated = await WorklogModel.findByIdAndUpdate(
                id,
                { $set: { ...rest, updatedAt: new Date() } },
                { new: true }
            ).lean<WorklogDocument>();

            if (!updated) throw new Error('Worklog not found');
            return this.mapToDomain(updated);
        } else {
            // Create new
            const doc = new WorklogModel(rest);
            const saved = await doc.save();
            return this.mapToDomain(saved.toObject());
        }
    }

    async findById(id: string): Promise<Worklog | null> {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) return null;
        const doc = await WorklogModel.findById(id).lean<WorklogDocument>();
        if (!doc) return null;
        return this.mapToDomain(doc);
    }

    async findByUserId(userId: string): Promise<Worklog[]> {
        const docs = await WorklogModel.find({ userId })
            .sort({ date: -1 })
            .lean<WorklogDocument[]>();
        return docs.map(d => this.mapToDomain(d));
    }

    async findByUserIdAndDate(userId: string, date: Date): Promise<Worklog | null> {
        const normalizedDate = new Date(date);
        normalizedDate.setUTCHours(0, 0, 0, 0);

        const nextDay = new Date(normalizedDate);
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);

        const doc = await WorklogModel.findOne({
            userId,
            date: { $gte: normalizedDate, $lt: nextDay },
        }).lean<WorklogDocument>();

        if (!doc) return null;
        return this.mapToDomain(doc);
    }

    async findAll(filters: WorklogFilters = {}): Promise<Worklog[]> {
        const query: Record<string, any> = {};

        if (filters.userId) query.userId = filters.userId;
        if (filters.status) query.status = filters.status;

        // Exact date filter
        if (filters.date) {
            const start = new Date(filters.date);
            start.setUTCHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setUTCDate(end.getUTCDate() + 1);
            query.date = { $gte: start, $lt: end };
        }

        // Date range filter (takes priority over exact date if both provided)
        if (filters.from || filters.to) {
            query.date = {};
            if (filters.from) query.date.$gte = filters.from;
            if (filters.to) query.date.$lt = filters.to;
        }

        const docs = await WorklogModel.find(query)
            .sort({ date: -1 })
            .lean<WorklogDocument[]>();

        return docs.map(d => this.mapToDomain(d));
    }

    async delete(id: string): Promise<boolean> {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) return false;
        const result = await WorklogModel.deleteOne({ _id: id });
        return result.deletedCount === 1;
    }

    private mapToDomain(doc: any): Worklog {
        const id = doc._id ? doc._id.toString() : doc.id;
        return new Worklog({
            id,
            userId: doc.userId.toString(),
            date: doc.date,
            tasks: doc.tasks,
            hoursWorked: doc.hoursWorked,
            status: doc.status,
            notes: doc.notes,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }
}

export const worklogRepository = new MongoWorklogRepository();
