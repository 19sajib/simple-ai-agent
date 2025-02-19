"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.todosTable = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
exports.todosTable = (0, pg_core_1.pgTable)("todos", {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    todo: (0, pg_core_1.text)().notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').$onUpdate(function () { return new Date(); })
});
