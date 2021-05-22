const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const existentUser = users.find(user => user.username === username);

  if (!existentUser) {
    return response.status(404).json({ error: 'User does not exist!' });
  }

  request.user = existentUser;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usernameAlreadyExists = users.some(user => user.username === username);

  if (usernameAlreadyExists) {
    return response.status(400).json({ error: 'Username already registered!' });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const existentTodo = user.todos.find(todo => todo.id === id);

  if (!existentTodo) {
    return response.status(404).json({ error: 'Todo do not exist' });
  }

  existentTodo.title = title;
  existentTodo.deadline = new Date(deadline);

  return response.json(existentTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const existentTodo = user.todos.find(todo => todo.id === id);

  if (!existentTodo) {
    return response.status(404).json({ error: 'Todo do not exist' });
  }

  existentTodo.done = true;

  return response.json(existentTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const existentTodo = user.todos.find(todo => todo.id === id);

  if (!existentTodo) {
    return response.status(404).json({ error: 'Todo do not exist' });
  }

  user.todos.splice(user.todos.indexOf(existentTodo), 1);

  return response.status(204).send();
});

module.exports = app;