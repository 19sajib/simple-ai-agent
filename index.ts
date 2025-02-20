import { eq, ilike } from 'drizzle-orm';
import { db } from './db/index'
import { todosTable } from './db/schema'
import Anthropic from '@anthropic-ai/sdk';
import readlineSync from 'readline-sync'
import { MessageParam } from '@anthropic-ai/sdk/resources';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Tools
async function getAllTodos() {
    const todos = await db.select().from(todosTable);
    return todos
}

async function createTodo(todo: string) {
    const [newTodo] = await db.insert(todosTable).values({
        todo
    }).returning({
        id: todosTable.id
    })

    return newTodo.id
}

async function searchTodo(search: string) {
    const todos = await db.select().from(todosTable).where(ilike(todosTable.todo, search))
    return todos
}

async function deleteTodoById(id: any){
    await db.delete(todosTable).where(eq(todosTable.id, id))
}

const tools = {
    getAllTodos: getAllTodos,
    createTodo: createTodo,
    searchTodo: searchTodo,
    deleteTodoById: deleteTodoById
}

const SYSTEM_PROMPT = `

You are an AI To-Do List Assistant with START, PLAN, ACTION, Observation and Output State. Wait for the user prompt and first PLAN using available tools.
After Planning, Take the action with appropriate tools and wait for Observation based on Action. Once you get the observations, Return the AI response based on START prompt and observations
You can manage tasks by adding, viewing, updating, and deleting them.
You must strictly follow the JSON output format.

Todo DB Schema:
id: Int and Primary Key
todo: String
created_at: Date Time updated_at: Date Time


Available Tools:
- getAllTodos(): Returns all the Todos from Database
- createTodo (todo: string): Creates a new Todo in the DB and takes todo as a string and returns the ID of created todo
- deleteTodoById(id: string): Deleted the todo by ID given in the DB
- searchTodo (query: string): Searches for all todos matching teh query string using iLike in DB

Example:
START
{ "type": "user", "user": "Add a task for shopping groceries." }
{ "type": "plan", "plan": "I will try to get more context on what user needs to shop." }
{ "type": "output", "output": "Can you tell me what all items you want to shop for?" }
{ "type": "user", "user": "I want to shop for milk, kitkat, lays and choco." }
{ "type": "plan", "plan": "I will use createTodo to create a new Todo in DB." }
{ "type": "action", "function": "createTodo", "input": "Shopping for milk, kitkat, lays and choco."
{ "type": "observation", "observation": "2" }
{ "type": "output", "output":"You todo has been added successfully" }
`

const messages: MessageParam[] = [{ "role": "user", "content": SYSTEM_PROMPT }]

while (true){
     const query = readlineSync.question('>> ')
     const userMessage = {
        type: 'user',
        user: query
     }
     messages.push({ "role": "user", "content": JSON.stringify(userMessage) })

     while (true) {
        const chat = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1024,
            messages: messages,
          });
        const result = chat.content[0]
        console.log(result);
        const action = JSON.parse(result)
     }
}

// interface UserMessage {
//     type: 'user';
//     user: string;
// }

// async function runChatClient() {
//     const messages: MessageParam[] = [{ "role": "user", "content": SYSTEM_PROMPT }];
    
//     console.log('Chat started. Type "exit" to quit.');
    
//     while (true) {
//         // Use simple console.log for the prompt
//         process.stdout.write('>> ');
//         const query = readlineSync.question('');
        
//         if (query.toLowerCase() === 'exit') {
//             console.log('Exiting chat...');
//             break;
//         }
        
//         const userMessage: UserMessage = {
//             type: 'user',
//             user: query
//         };
        
//         messages.push({ "role": "user", "content": JSON.stringify(userMessage) });
        
//         try {
//             const chat = await anthropic.messages.create({
//                 model: "claude-3-5-sonnet-20241022",
//                 max_tokens: 1024,
//                 messages: messages,
//             });
            
//             // Fixed: Accessing content array properly
//             const result = chat.content[0].text;
//             console.log('\nAssistant:', result);
            
//             try {
//                 const action = JSON.parse(result);
//                 // Handle the parsed action here
//             } catch (parseError) {
//                 console.error('Error parsing response:', parseError.message);
//             }
            
//         } catch (error) {
//             console.error('Error in chat request:', error.message);
//         }
//     }
// }

// // Start the chat client
// runChatClient().catch(console.error);

