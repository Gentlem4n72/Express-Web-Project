import fs from 'fs'
import express, { type Express, type Request, type Response } from 'express';

const app: Express = express();

const PORT = 3000;
const DB_FILE = 'db.txt';

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.get('/users', (req: Request, res: Response) => {
  fs.readFile('db.txt', 'utf8', (err, data) => {
    if (err) {
      console.error('Ошибка:', err);
      res.status(500);
      res.send('Error reading DB');
      return;
    }
    res.send(data);
  });
});

app.post('/user', (req: Request, res: Response) => {
  const {username, id} = req.body
  if (!id || !username) {
    res.status(400)
    res.send('id and username required')
  }

  fs.appendFile(DB_FILE, `${id}:${username}, `, (err) => {
    if (err) {
      console.error('Ошибка:', err);
      return;
    }
    console.log('Файл записан успешно!');
  });

  res.send(`User with ${username} and ${id} saved in DB`);
});

app.get('/user/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  
  fs.readFile('db.txt', 'utf8', (err, data) => {
    if (err) {
      console.error('Ошибка:', err);
      res.status(500)
      res.send('Error reading DB');
      return;
    }
    
    const users = data.split(', ').filter(entry => entry.trim() !== '');
    const user = users.find(entry => entry.startsWith(`${id}:`));
    
    if (!user) {
      res.status(404)
      res.send('User not found');
      return;
    }
    
    const [userId, username] = user.split(':');
    res.send(`User with id=${userId} found. His username is ${username}`);
  });
});

app.patch('/user/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const username = req.body.username;
  
  if (!username) {
    res.status(400).send('username required');
    return;
  }
  
  fs.readFile('db.txt', 'utf8', (err, data) => {
    if (err) {
      console.error('Ошибка:', err);
      res.status(500).send('Error reading DB');
      return;
    }
    
    const users = data.split(', ').filter(entry => entry.trim() !== '');
    const userIndex = users.findIndex(entry => entry.startsWith(`${id}:`));
    
    if (userIndex === -1) {
      res.status(404).send('User not found');
      return;
    }
    
    users[userIndex] = `${id}:${username}`;
    const newData = users.join(', ') + ', ';
    
    fs.writeFile('db.txt', newData, (err) => {
      if (err) {
        console.error('Ошибка:', err);
        res.status(500).send('Error writing DB');
        return;
      }
      res.send(`User with id=${id} updated to username=${username}`);
    });
  });
});


app.delete('/user/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  
  fs.readFile('db.txt', 'utf8', (err, data) => {
    if (err) {
      console.error('Ошибка:', err);
      res.status(500).send('Error reading DB');
      return;
    }
    
    const users = data.split(', ').filter(entry => entry.trim() !== '');
    const filteredUsers = users.filter(entry => !entry.startsWith(`${id}:`));
    
    if (users.length === filteredUsers.length) {
      res.status(404).send('User not found');
      return;
    }
    
    const newData = filteredUsers.length > 0 ? filteredUsers.join(', ') + ', ' : '';
    
    fs.writeFile('db.txt', newData, (err) => {
      if (err) {
        console.error('Ошибка:', err);
        res.status(500).send('Error writing DB');
        return;
      }
      res.send(`User with id=${id} deleted`);
    });
  });
});

app.listen(PORT, ()=>{
  console.log(`App listening on ${PORT}`)
});