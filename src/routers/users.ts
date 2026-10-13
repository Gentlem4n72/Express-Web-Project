import fs from 'fs'
import express, { type Request, type Response, type NextFunction } from 'express';
import usersMiddleware from "../middlewares/users-middleware.ts"

const router = express.Router();

const DB_FILE = 'db.txt';

router.use(usersMiddleware)

router.get('/', (req: Request, res: Response) => {
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

router.post('/', (req: Request, res: Response) => {
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

router.get('/:id', (req: Request, res: Response) => {
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

router.patch('/:id', (req: Request, res: Response) => {
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


router.delete('/:id', (req: Request, res: Response) => {
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

export default router;