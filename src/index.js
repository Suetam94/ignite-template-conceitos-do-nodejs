const express = require('express');
const cors = require('cors');

const {v4: uuidv4} = require('uuid');
const {use} = require("express/lib/router");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  request.user = users.find(user => user.username === username);

  if (!request.user) {
    return response.status(400).json({error: 'User not found'}).send();
  }

  return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const alreadyExists = users.some(user => user.username === username);

  if (alreadyExists) {
    return response.status(400).json({error: "Username already exists."}).send();
  }

  const newUser = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: []
  }

  users.push(newUser);

  return response.status(201).json(newUser).send();
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;

  return response.json(user.todos).status(200).send();
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;

  const {title, deadline} = request.body;

  if (!title || !deadline) {
    return response.status(400).json({error: "Something went wrong, please check your title or deadline parameter and try again"}).send();
  }

  const newTodo = {
    id: uuidv4(),
    title: request.body.title,
    done: false,
    deadline: new Date(request.body.deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo).send();
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({error: "No task find, please check the id param and try again."}).send();
  }

  if (request.body.title) {
    todo.title = request.body.title;
  }

  if (request.body.deadline) {
    todo.deadline = request.body.deadline;
  }

  return response.status(200).json(todo).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({error: "No task find, please check the id param and try again."}).send();
  }

  todo.done = true;

  return response.status(200).json(todo).send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  
  const indexItem = user.todos.findIndex(todo => todo.id === id);

  if (indexItem < 0) {
    return response.status(404).json({error: "No task find, please check the id param and try again."}).send();
  }

  user.todos.splice(indexItem);

  return response.status(204).json(user.todos).send();
});

module.exports = app;