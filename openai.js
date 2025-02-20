"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var drizzle_orm_1 = require("drizzle-orm");
var index_1 = require("./db/index");
var schema_1 = require("./db/schema");
var readline_sync_1 = require("readline-sync");
var openai_1 = require("openai");
var client = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
// Tools
function getAllTodos() {
    return __awaiter(this, void 0, void 0, function () {
        var todos;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, index_1.db.select().from(schema_1.todosTable)];
                case 1:
                    todos = _a.sent();
                    return [2 /*return*/, todos];
            }
        });
    });
}
function createTodo(todo) {
    return __awaiter(this, void 0, void 0, function () {
        var newTodo;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, index_1.db.insert(schema_1.todosTable).values({
                        todo: todo
                    }).returning({
                        id: schema_1.todosTable.id
                    })];
                case 1:
                    newTodo = (_a.sent())[0];
                    return [2 /*return*/, newTodo.id];
            }
        });
    });
}
function searchTodo(search) {
    return __awaiter(this, void 0, void 0, function () {
        var todos;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, index_1.db.select().from(schema_1.todosTable).where((0, drizzle_orm_1.ilike)(schema_1.todosTable.todo, search))];
                case 1:
                    todos = _a.sent();
                    return [2 /*return*/, todos];
            }
        });
    });
}
function deleteTodoById(id) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, index_1.db.delete(schema_1.todosTable).where((0, drizzle_orm_1.eq)(schema_1.todosTable.id, id))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
var tools = {
    getAllTodos: getAllTodos,
    createTodo: createTodo,
    searchTodo: searchTodo,
    deleteTodoById: deleteTodoById
};
var SYSTEM_PROMPT = "\n\nYou are an AI To-Do List Assistant with START, PLAN, ACTION, Observation and Output State. Wait for the user prompt and first PLAN using available tools.\nAfter Planning, Take the action with appropriate tools and wait for Observation based on Action. Once you get the observations, Return the AI response based on START prompt and observations\nYou can manage tasks by adding, viewing, updating, and deleting them.\nYou must strictly follow the JSON output format.\n\nTodo DB Schema:\nid: Int and Primary Key\ntodo: String\ncreated_at: Date Time updated_at: Date Time\n\n\nAvailable Tools:\n- getAllTodos(): Returns all the Todos from Database\n- createTodo (todo: string): Creates a new Todo in the DB and takes todo as a string and returns the ID of created todo\n- deleteTodoById(id: string): Deleted the todo by ID given in the DB\n- searchTodo (query: string): Searches for all todos matching teh query string using iLike in DB\n\nExample:\nSTART\n{ \"type\": \"user\", \"user\": \"Add a task for shopping groceries.\" }\n{ \"type\": \"plan\", \"plan\": \"I will try to get more context on what user needs to shop.\" }\n{ \"type\": \"output\", \"output\": \"Can you tell me what all items you want to shop for?\" }\n{ \"type\": \"user\", \"user\": \"I want to shop for milk, kitkat, lays and choco.\" }\n{ \"type\": \"plan\", \"plan\": \"I will use createTodo to create a new Todo in DB.\" }\n{ \"type\": \"action\", \"function\": \"createTodo\", \"input\": \"Shopping for milk, kitkat, lays and choco.\"\n{ \"type\": \"observation\", \"observation\": \"2\" }\n{ \"type\": \"output\", \"output\":\"You todo has been added successfully\" }\n";
var messages = [{ "role": "user", "content": SYSTEM_PROMPT }];
while (true) {
    var query = readline_sync_1.default.question('>> ');
    var userMessage = {
        type: 'user',
        user: query
    };
    messages.push({ "role": "user", "content": JSON.stringify(userMessage) });
    while (true) {
        var chat = await client.chat.completions.create({
            model: 'gpt-4',
            messages: messages,
            response_format: { type: 'json_object' }
        });
        var result = chat.choices[0].message.content;
        console.log(result);
        var action = JSON.parse(result);
    }
}
